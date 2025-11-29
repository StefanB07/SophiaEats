package service;

import domain.*;
import repository.DeliveryCatalogRepository;
import repository.RestaurantRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/*
  Service class responsible for handling the business logic related to orders.
  The OrderService acts as an intermediary between the application’s domain (Cart, Order)
  and the infrastructure layer (HTTP handlers, repositories).
*/
public class OrderService {

    private final DeliveryCatalogRepository delivery;     // validate delivery locations and slots
    private final RestaurantRepository restaurants;       // determine the source restaurant for each dish

    // Strategy registry for payments
    private final Map<PaymentMethod, PaymentProcessor> paymentProcessors = new EnumMap<>(PaymentMethod.class);

    // Preferred constructor (with dependencies)
    public OrderService(DeliveryCatalogRepository delivery, RestaurantRepository restaurants) {
        this.delivery = Objects.requireNonNull(delivery);
        this.restaurants = Objects.requireNonNull(restaurants);
        initDefaultPaymentProcessors();
    }

    // Legacy constructor for compatibility; will not perform the newer validations
    public OrderService() {
        this.delivery = null;
        this.restaurants = null;
        initDefaultPaymentProcessors();
    }

    private void initDefaultPaymentProcessors() {
        // External payment: simulate success
        paymentProcessors.put(PaymentMethod.EXTERNAL, new ExternalPaymentProcessor());

        // Student credit payment: validate and debit credit
        paymentProcessors.put(PaymentMethod.STUDENT_CREDIT, (order, user) -> {
            if (user == null || user.getStudentCredit() == null) {
                throw new IllegalArgumentException("INSUFFICIENT_CREDIT");
            }
            double amount = order.getTotal();
            if (user.getStudentCredit().getBudget() < amount) {
                throw new IllegalArgumentException("INSUFFICIENT_CREDIT");
            }
            user.getStudentCredit().setBudget(user.getStudentCredit().getBudget() - amount);
            Payment p = new Payment(PaymentMethod.STUDENT_CREDIT, amount);
            p.setSuccess(true);
            order.setPayment(p);
            order.setStatus(OrderStatus.PAID);
            order.setPaidAt(java.time.LocalDateTime.now());
            return p;
        });
    }

//    public Order placeOrder(Cart cart, DeliveryLocation deliveryPlace, LocalDateTime deliveryTime) {
//        if (cart == null || cart.getItems().isEmpty())
//            throw new IllegalArgumentException("Cart is empty");
//        if (deliveryPlace == null || deliveryPlace.getName().isBlank())
//            throw new IllegalArgumentException("Delivery place required");
//        if (deliveryTime == null || deliveryTime.isBefore(LocalDateTime.now()))
//            throw new IllegalArgumentException("Delivery time must be in the future");
//
//        // Validate: delivery location must exist in catalog (if repo is injected)
//        if (delivery != null && !delivery.isValidLocation(deliveryPlace.getName())) {
//            throw new IllegalArgumentException("Invalid delivery location: " + deliveryPlace);
//        }
//
//        // Validate: all items must come from a single restaurant (if repo is injected)
//        Restaurant sourceRestaurant = null;
//        if (restaurants != null) {
//            ensureSingleRestaurant(cart.getItems());
//            // Determine the source restaurant using the first dish
//            sourceRestaurant = findRestaurantByDishOrThrow(cart.getItems().get(0).getDish());
//        }
//
//        // Validate: the selected slot can accept the ordered quantity (minimal check)
//        if (delivery != null && sourceRestaurant != null) {
//            int totalQty = cart.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
//            var slots = delivery.slotsFor(sourceRestaurant.getId());
//            var selectedSlotOpt = slots.stream()
//                    .filter(s -> deliveryTime.equals(s.getStart()))
//                    .findFirst();
//            if (selectedSlotOpt.isEmpty()) {
//                throw new IllegalArgumentException("No delivery slot available at requested time");
//            }
//            var slot = selectedSlotOpt.get();
//            if (!slot.canFit(totalQty)) {
//                throw new IllegalStateException("DELIVERY_SLOT_CAPACITY_EXCEEDED");
//            }
//            // Reserve capacity for this order so later availability reflects it
//            boolean reservedOk = slot.reserve(totalQty);
//            if (!reservedOk) {
//                // Edge case: capacity changed between check and reserve
//                throw new IllegalStateException("DELIVERY_SLOT_CAPACITY_EXCEEDED");
//            }
//        }
//
//        // Copy the items from the cart to the order
//        List<OrderItem> items = List.copyOf(cart.getItems());
//        Order order = new Order(items, deliveryPlace, deliveryTime);
//        cart.clear(); // empty the cart after placing the order
//        return order;
//
//    }
    public Order placeOrder(Cart cart, DeliveryLocation deliveryPlace, LocalDateTime deliveryTime) {
        if (cart == null || cart.getItems().isEmpty())
            throw new IllegalArgumentException("Cart is empty");
        if (deliveryPlace == null || deliveryPlace.getName().isBlank())
            throw new IllegalArgumentException("Delivery place required");
        if (deliveryTime == null || deliveryTime.isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Delivery time must be in the future");

        // 1) Validare: locația de livrare trebuie să existe în catalog (dacă avem repo injectat)
        if (delivery != null && !delivery.isValidLocation(deliveryPlace.getName())) {
            throw new IllegalArgumentException("Invalid delivery location: " + deliveryPlace);
        }

        // 2) Validare: toate item-ele trebuie să provină dintr-un singur restaurant
        Restaurant sourceRestaurant = null;
        if (restaurants != null) {
            ensureSingleRestaurant(cart.getItems());
            // determinăm restaurantul sursă folosind primul dish
            sourceRestaurant = findRestaurantByDishOrThrow(cart.getItems().get(0).getDish());
        }

        // 3) Validare + consumare slot de livrare (R5)
        if (delivery != null && sourceRestaurant != null) {
            int totalQty = cart.getItems().stream().mapToInt(OrderItem::getQuantity).sum();

            // luăm lista de sloturi pentru restaurant (lista reală din repo)
            List<DeliverySlot> slots = delivery.slotsFor(sourceRestaurant.getId());

            // găsim slotul exact pentru ora cerută
            Optional<DeliverySlot> selectedSlotOpt = slots.stream()
                    .filter(s -> deliveryTime.equals(s.getStart()))
                    .findFirst();

            if (selectedSlotOpt.isEmpty()) {
                throw new IllegalArgumentException("No delivery slot available at requested time");
            }

            DeliverySlot slot = selectedSlotOpt.get();

            // verificăm dacă încap toate comenzile în slot
            if (!slot.canFit(totalQty)) {
                throw new IllegalStateException("DELIVERY_SLOT_CAPACITY_EXCEEDED");
            }

            // rezervăm efectiv capacitatea
            boolean reservedOk = slot.reserve(totalQty);
            if (!reservedOk) {
                // Edge case: între timp slotul a fost modificat de altă comandă
                throw new IllegalStateException("DELIVERY_SLOT_CAPACITY_EXCEEDED");
            }

            // 🔴 NOU: dacă după rezervare capacitatea a ajuns la 0, scoatem slotul din listă
            // astfel nu va mai apărea la următoarele /delivery/slots sau /cart/delivery-options
            if (slot.getCapacity() <= 0) {
                slots.remove(slot);
            }
        }

        // 4) creăm efectiv comanda și golim coșul
        List<OrderItem> items = List.copyOf(cart.getItems());
        Order order = new Order(items, deliveryPlace, deliveryTime);
        cart.clear(); // curățăm coșul după plasare

        return order;
    }

    /**
     * Create and process a Payment for the given order using the given method.
     * Delegates to a PaymentProcessor strategy registered for the method.
     * On success: attaches payment, sets PAID status and paidAt timestamp.
     */
    public Payment pay(Order order, PaymentMethod method, CampusUser user) {
        PaymentProcessor processor = paymentProcessors.get(method);
        if (processor == null) {
            throw new UnsupportedOperationException("No payment processor for method: " + method);
        }
        return processor.process(order, user);
    }

    /** Mark order as DELIVERED if it is in PAID state, and set deliveredAt. */
    public void markAsDelivered(Order order) {
        Objects.requireNonNull(order, "order");
        if (order.getStatus() != OrderStatus.PAID) {
            throw new IllegalStateException("Order not in PAID state");
        }
        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());
    }

    // --- Helpers ---

    private void ensureSingleRestaurant(List<OrderItem> items) {
        // Find the restaurant for each dish by scanning restaurant menus
        Set<String> restNames = items.stream()
                .map(OrderItem::getDish)
                .map(this::findRestaurantByDishOrThrow)
                .map(Restaurant::getName)
                .collect(Collectors.toSet());

        if (restNames.size() > 1) {
            throw new IllegalArgumentException("All items must be from one restaurant");
        }
    }

    private Restaurant findRestaurantByDishOrThrow(Dish dish) {
        Optional<Restaurant> found = restaurants.findAll().stream()
                .filter(r -> r.getMenu().contains(dish))
                .findFirst();
        if (found.isEmpty()) {
            throw new IllegalStateException("Dish not found in any restaurant menu: " + dish.getName());
        }
        return found.get();
    }

    // === Strategy pattern (minimal, inlined) ===
    @FunctionalInterface
    public interface PaymentProcessor {
        Payment process(Order order, CampusUser user);
    }

    public static class ExternalPaymentProcessor implements PaymentProcessor {
        @Override
        public Payment process(Order order, CampusUser user) {
            double amount = order.getTotal();
            Payment payment = new Payment(PaymentMethod.EXTERNAL, amount);
            payment.setSuccess(true);
            order.setPayment(payment);
            order.setStatus(OrderStatus.PAID);
            order.setPaidAt(java.time.LocalDateTime.now());
            return payment;
        }
    }
}

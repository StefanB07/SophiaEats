package service;

import domain.*;
import repository.DeliveryCatalogRepository;
import repository.RestaurantRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service class responsible for handling the business logic related to orders.
 * The OrderService acts as an intermediary between the application’s domain (Cart, Order)
 * and the infrastructure layer (HTTP handlers, repositories).
 */
public class OrderService {

    private final DeliveryCatalogRepository delivery;     // validate delivery locations and slots
    private final RestaurantRepository restaurants;       // determine the source restaurant for each dish

    // Preferred constructor (with dependencies)
    public OrderService(DeliveryCatalogRepository delivery, RestaurantRepository restaurants) {
        this.delivery = Objects.requireNonNull(delivery);
        this.restaurants = Objects.requireNonNull(restaurants);
    }

    // Legacy constructor for compatibility; will not perform the newer validations
    public OrderService() {
        this.delivery = null;
        this.restaurants = null;
    }

    public Order placeOrder(Cart cart, String deliveryPlace, LocalDateTime deliveryTime) {
        if (cart == null || cart.getItems().isEmpty())
            throw new IllegalArgumentException("Cart is empty");
        if (deliveryPlace == null || deliveryPlace.isBlank())
            throw new IllegalArgumentException("Delivery place required");
        if (deliveryTime == null || deliveryTime.isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Delivery time must be in the future");

        // Validate: delivery location must exist in catalog (if repo is injected)
        if (delivery != null && !delivery.isValidLocation(deliveryPlace)) {
            throw new IllegalArgumentException("Invalid delivery location: " + deliveryPlace);
        }

        // Validate: all items must come from a single restaurant (if repo is injected)
        Restaurant sourceRestaurant = null;
        if (restaurants != null) {
            ensureSingleRestaurant(cart.getItems());
            // Determine the source restaurant using the first dish
            sourceRestaurant = findRestaurantByDishOrThrow(cart.getItems().get(0).getDish());
        }

        // Validate: the selected slot can accept the ordered quantity (minimal check)
        if (delivery != null && sourceRestaurant != null) {
            int totalQty = cart.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
            var slots = delivery.slotsFor(sourceRestaurant.getId());
            var selectedSlotOpt = slots.stream()
                    .filter(s -> deliveryTime.equals(s.getStart()))
                    .findFirst();
            if (selectedSlotOpt.isEmpty()) {
                throw new IllegalArgumentException("No delivery slot available at requested time");
            }
            var slot = selectedSlotOpt.get();
            if (!slot.canFit(totalQty)) {
                throw new IllegalStateException("DELIVERY_SLOT_CAPACITY_EXCEEDED");
            }
            // Reserve capacity for this order so later availability reflects it
            boolean reservedOk = slot.reserve(totalQty);
            if (!reservedOk) {
                // Edge case: capacity changed between check and reserve
                throw new IllegalStateException("DELIVERY_SLOT_CAPACITY_EXCEEDED");
            }
        }

        // Copy the items from the cart to the order
        List<OrderItem> items = List.copyOf(cart.getItems());
        Order order = new Order(items, deliveryPlace, deliveryTime);
        cart.clear(); // empty the cart after placing the order
        return order;

    }



    // --- Payment & lifecycle helpers ---

    /** Legacy simulation hook. Prefer pay(order, method) for full flow. */
    public boolean tempExternalPayment(Order order) {
        Objects.requireNonNull(order, "order");
        return true; // always approved for now
    }

    /**
     * Create and process a Payment for the given order using the given method.
     * For EXTERNAL, processing is simulated and always accepted.
     * For CREDIT, verifies the user's balance before debiting.
     * On success: attaches payment, sets PAID status and paidAt timestamp.
     */
    public Payment pay(Order order, PaymentMethod method, CampusUser user) {
        double amount = order.getTotal();
        Payment payment = new Payment(method, amount);

        if (method == PaymentMethod.STUDENT_CREDIT) {
            if (user.getStudentCredit() == null || user.getStudentCredit().getBudget() < amount) {
                throw new IllegalArgumentException("INSUFFICIENT_CREDIT");
            }
            user.getStudentCredit().setBudget(user.getStudentCredit().getBudget() - amount);
            payment.setSuccess(true);
        } else { // EXTERNAL
            payment.setSuccess(true);
        }

        order.setPayment(payment);
        if (payment.isSuccess()) {
            order.setStatus(OrderStatus.PAID);
            order.setPaidAt(java.time.LocalDateTime.now());
        }
        return payment;
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
}

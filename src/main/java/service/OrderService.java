//package service;
//
//import domain.Cart;
//import domain.Order;
//import domain.OrderItem;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
///**
// * Service class responsible for handling the business logic related to orders.
// * The OrderService acts as an intermediary between the application’s domain (Cart, Order)
// * and the infrastructure layer (HTTP handlers, repositories).
// */
//public class OrderService {
//
//    public Order placeOrder(Cart cart, String deliveryPlace, LocalDateTime deliveryTime) {
//        if (cart == null || cart.getItems().isEmpty())
//            throw new IllegalArgumentException("Cart is empty");
//        if (deliveryPlace == null || deliveryPlace.isBlank())
//            throw new IllegalArgumentException("Delivery place required");
//        if (deliveryTime == null || deliveryTime.isBefore(LocalDateTime.now()))
//            throw new IllegalArgumentException("Delivery time must be in the future");
//
//        // Copy all the items from the cart to the order
//        List<OrderItem> items = List.copyOf(cart.getItems());
//        return new Order(items, deliveryPlace, deliveryTime);
//    }
//}
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

    private final DeliveryCatalogRepository delivery;     // pentru validare locații
    private final RestaurantRepository restaurants;       // pentru a determina sursa fiecărui Dish

    // Constructor recomandat (cu dependențe)
    public OrderService(DeliveryCatalogRepository delivery, RestaurantRepository restaurants) {
        this.delivery = Objects.requireNonNull(delivery);
        this.restaurants = Objects.requireNonNull(restaurants);
    }

    // (Opțional) constructor vechi pentru compatibilitate; NU va face validările noi
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

        // ✅ Validare: locația de livrare există în catalog (dacă avem repo injectat)
        if (delivery != null && !delivery.isValidLocation(deliveryPlace)) {
            throw new IllegalArgumentException("Invalid delivery location: " + deliveryPlace);
        }

        // ✅ Validare: toate item-urile provin din același restaurant (dacă avem repo injectat)
        if (restaurants != null) {
            ensureSingleRestaurant(cart.getItems());
        }

        // Copiem item-urile în comandă
        List<OrderItem> items = List.copyOf(cart.getItems());
        Order order = new Order(items, deliveryPlace, deliveryTime);
        cart.clear(); // golește coșul după plasarea comenzii
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
        Objects.requireNonNull(order, "order");
        Objects.requireNonNull(method, "method");
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order not in CREATED state");
        }

        Payment payment = new Payment(method, order.getTotal());

        if (method == PaymentMethod.STUDENT_CREDIT) {
            if (user == null || user.getStudentCredit() == null) {
                throw new IllegalStateException("NO_STUDENT_CREDIT_ACCOUNT");
            }

            Double budget = user.getStudentCredit().getBudget();
            Double total = order.getTotal();

            if (budget.compareTo(total) < 0) {
                throw new IllegalStateException("INSUFFICIENT_CREDIT");
            }

            // Debit the user's credit
            double newBudget = budget - total;

            // Mark payment as successful and attach to order
            payment.process(user);
            if (payment.isSuccess()) {
                order.setPayment(payment);
                order.setStatus(OrderStatus.PAID);
                order.setPaidAt(LocalDateTime.now());
            }

            user.getStudentCredit().setBudget(newBudget);

            return payment;
        }

        // Default: EXTERNAL payment path
        payment.process(user);
        if (payment.isSuccess()) {
            order.setPayment(payment);
            order.setStatus(OrderStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
        }
        return payment;
    }


    /** Mark order as PAID if it is in CREATED state, and set paidAt. */
    public void markAsPaid(Order order) {
        Objects.requireNonNull(order, "order");
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order not in CREATED state");
        }
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
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
        // găsim restaurantul pentru fiecare Dish uitându-ne în meniurile restaurantelor
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

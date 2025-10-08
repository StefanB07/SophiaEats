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

import domain.Cart;
import domain.Dish;
import domain.Order;
import domain.OrderItem;
import domain.Restaurant;
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
        return new Order(items, deliveryPlace, deliveryTime);
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

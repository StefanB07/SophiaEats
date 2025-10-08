package service;

import domain.Cart;
import domain.Order;
import domain.OrderItem;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class responsible for handling the business logic related to orders.
 * The OrderService acts as an intermediary between the application’s domain (Cart, Order)
 * and the infrastructure layer (HTTP handlers, repositories).
 */
public class OrderService {

    public Order placeOrder(Cart cart, String deliveryPlace, LocalDateTime deliveryTime) {
        if (cart == null || cart.getItems().isEmpty())
            throw new IllegalArgumentException("Cart is empty");
        if (deliveryPlace == null || deliveryPlace.isBlank())
            throw new IllegalArgumentException("Delivery place required");
        if (deliveryTime == null || deliveryTime.isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Delivery time must be in the future");

        // Copy all the items from the cart to the order
        List<OrderItem> items = List.copyOf(cart.getItems());
        return new Order(items, deliveryPlace, deliveryTime);
    }
}

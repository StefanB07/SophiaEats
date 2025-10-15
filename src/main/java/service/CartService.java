package service;

import domain.Cart;
import domain.Dish;
import domain.OrderItem;
import domain.Restaurant;
import repository.CartRepository;
import repository.RestaurantRepository;

public class CartService {
    private final CartRepository carts;
    private final RestaurantRepository restaurants;
    public CartService(CartRepository carts, RestaurantRepository restaurants) {
        this.carts = carts;
        this.restaurants = restaurants;
    }

    public void addItem(Cart cart, Restaurant restaurant, Dish dish, int qty) {
        cart.addItem(new OrderItem(dish, qty));
        carts.save(cart);
    }
}

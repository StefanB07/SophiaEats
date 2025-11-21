package service;

import domain.Cart;
import domain.Dish;
import domain.OrderItem;
import domain.Restaurant;
import domain.CampusUser;
import repository.CartRepository;
import repository.RestaurantRepository;

import java.util.ArrayList;
import java.util.List;

public class CartService {
    private final CartRepository carts;
    private final RestaurantRepository restaurants;

    // Minimal observer list
    private final List<CartListener> listeners = new ArrayList<>();

    public CartService(CartRepository carts, RestaurantRepository restaurants) {
        this.carts = carts;
        this.restaurants = restaurants;
    }

    // per-user cart helper
    public Cart getOrCreateCart(CampusUser user) {
        if (user == null) return carts.createCart();
        return carts.getOrCreateForUserId(user.getId());
    }

    // New: per-user cart by userId (no CampusUser instance needed)
    public Cart getOrCreateCartByUserId(String userId) {
        return carts.getOrCreateForUserId(userId);
    }

    public void addItem(Cart cart, Restaurant restaurant, Dish dish, int qty) {
        if (qty <= 0) throw new IllegalArgumentException("Quantity must be positive");
        cart.addItem(new OrderItem(dish, qty));
        carts.save(cart);
        notifyItemAdded(cart, restaurant);
    }

    // ---- Observer minimal api ----
    public interface CartListener {
        void onItemAdded(Cart cart, Restaurant restaurant);
        default void onCleared(Cart cart) { }
    }

    public void addListener(CartListener l) {
        if (l != null) listeners.add(l);
    }

    public void removeListener(CartListener l) {
        listeners.remove(l);
    }

    private void notifyItemAdded(Cart cart, Restaurant restaurant) {
        for (CartListener l : listeners) {
            try { l.onItemAdded(cart, restaurant); } catch (Exception ignored) { }
        }
    }

    public void clear(Cart cart) {
        if (cart == null) return;
        cart.clear();
        carts.save(cart);
        for (CartListener l : listeners) {
            try { l.onCleared(cart); } catch (Exception ignored) { }
        }
    }

}

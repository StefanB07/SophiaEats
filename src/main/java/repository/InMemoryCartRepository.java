package repository;
import repository.interfaces.CartRepository;

import domain.order.Cart;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory repository for carts.
 * Supports multiple carts identified by unique IDs.
 */
public class InMemoryCartRepository implements CartRepository {
    private final Map<String, Cart> carts = new ConcurrentHashMap<>();
    // New: one active cart per user (by userId)
    private final Map<String, Cart> cartsByUserId = new ConcurrentHashMap<>();

    public Cart createCart() {
        Cart newCart = new Cart();
        carts.put(newCart.getId(), newCart);
        return newCart;
    }

    public Optional<Cart> findById(String id) {
        return Optional.ofNullable(carts.get(id));
    }

    // ReturneazÄƒ toate coÈ™urile
    public Collection<Cart> findAll() {
        return carts.values();
    }

    public Cart save(Cart cart) {
        carts.put(cart.getId(), cart);
        // Keep user mapping in sync if owner is set
        if (cart.getOwnerUserId() != null && !cart.getOwnerUserId().isBlank()) {
            cartsByUserId.put(cart.getOwnerUserId(), cart);
        }
        return cart;
    }

    // È˜terge un coÈ™ dupÄƒ ID
    public void delete(String id) {
        Cart removed = carts.remove(id);
        if (removed != null) {
            cartsByUserId.entrySet().removeIf(e -> Objects.equals(e.getValue().getId(), id));
        }
    }

    // È˜terge toate coÈ™urile
    public void clear() {
        carts.clear();
        cartsByUserId.clear();
    }

    // --- Per-user helpers ---

    /** Get the user's active cart, or create a fresh one bound to this user. */
    public Cart getOrCreateForUserId(String userId) {
        if (userId == null || userId.isBlank()) return createCart();
        return cartsByUserId.computeIfAbsent(userId, id -> {
            Cart c = createCart();
            c.setOwnerUserId(id);
            carts.put(c.getId(), c);
            return c;
        });
    }

    /** Find the user's active cart if any. */
    public Optional<Cart> findByUserId(String userId) {
        if (userId == null || userId.isBlank()) return Optional.empty();
        return Optional.ofNullable(cartsByUserId.get(userId));
    }

    /** Remove the user's cart association (!!!does not delete the cart object). */
    public void removeForUserId(String userId) {
        if (userId == null || userId.isBlank()) return;
        cartsByUserId.remove(userId);
    }
}

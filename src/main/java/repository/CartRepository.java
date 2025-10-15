package repository;

import domain.Cart;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory repository for carts.
 * Supports multiple carts identified by unique IDs.
 */
public class CartRepository {
    private final Map<String, Cart> carts = new ConcurrentHashMap<>();

    // Creează și salvează un coș nou (de exemplu pentru un user)
    public Cart createCart() {
        Cart newCart = new Cart();
        carts.put(newCart.getId(), newCart);
        return newCart;
    }

    // Caută un coș după ID
    public Optional<Cart> findById(String id) {
        return Optional.ofNullable(carts.get(id));
    }

    // Returnează toate coșurile
    public Collection<Cart> findAll() {
        return carts.values();
    }

    // Salvează / actualizează un coș (dacă există deja, îl suprascrie)
    public Cart save(Cart cart) {
        carts.put(cart.getId(), cart);
        return cart;
    }

    // Șterge un coș după ID
    public void delete(String id) {
        carts.remove(id);
    }

    // Șterge toate coșurile
    public void clear() {
        carts.clear();
    }
}

package repository;

import domain.Cart;
import domain.Cart;

import java.util.*;

/**
 * Simple in-memory repository for carts.
 * Supports multiple carts identified by UUID.
 */
public class CartRepository {
    private final Map<String, Cart> carts = new HashMap<>();
    private final Cart demoCart = new Cart(); // păstrat pentru compatibilitate

    // 🔹 Returnează un coș de test (vechiul comportament)
    public Cart getDemoCart() {
        return demoCart;
    }

    // 🔹 Creează și salvează un coș nou (de exemplu pentru un user nou)
    public Cart createCart() {
        Cart newCart = new Cart();
        carts.put(newCart.getId(), newCart);
        return newCart;
    }

    // 🔹 Caută un coș după ID
    public Optional<Cart> findById(String id) {
        return Optional.ofNullable(carts.get(id));
    }

    // 🔹 Returnează toate coșurile
    public List<Cart> findAll() {
        return new ArrayList<>(carts.values());
    }

    // 🔹 Salvează / actualizează un coș (dacă există deja, îl suprascrie)
    public void save(Cart cart) {
        carts.put(cart.getId(), cart);
    }

    // 🔹 Șterge un coș după ID
    public void delete(UUID id) {
        carts.remove(id);
    }

    // 🔹 Șterge tot (inclusiv demoCart)
    public void clear() {
        carts.clear();
        demoCart.clear();
    }
}

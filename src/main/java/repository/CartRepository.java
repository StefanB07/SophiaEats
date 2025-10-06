package repository;

import domain.Cart;

public class CartRepository {
    private final Cart demoCart = new Cart();
    public Cart getDemoCart() { return demoCart; }
}

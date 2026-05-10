package repository.jdbc;

import domain.order.Cart;
import repository.interfaces.CartRepository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

public class JdbcCartRepository implements CartRepository {
    @Override
    public Cart createCart() {
        return new Cart();
    }

    @Override
    public Cart save(Cart cart) {
        return cart;
    }

    @Override
    public Optional<Cart> findById(String id) {
        return Optional.empty();
    }

    @Override
    public Collection<Cart> findAll() {
        return new ArrayList<>();
    }

    @Override
    public void delete(String id) {
    }

    @Override
    public void clear() {
    }

    @Override
    public Cart getOrCreateForUserId(String userId) {
        return new Cart(); // simplistic stub
    }

    @Override
    public Optional<Cart> findByUserId(String userId) {
        return Optional.empty();
    }

    @Override
    public void removeForUserId(String userId) {
    }
}

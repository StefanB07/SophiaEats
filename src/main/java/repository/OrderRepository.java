package repository;

import domain.Order;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public class OrderRepository {
    private final Map<String, Order> byId = new ConcurrentHashMap<>();

    public Order save(Order o) {
        byId.put(o.getId(), o);
        return o;
    }

    public Optional<Order> findById(String id) {
        return Optional.ofNullable(byId.get(id));
    }
}

package repository;
import repository.interfaces.OrderRepository;
import repository.interfaces.OrderRepository;

import domain.order.Order;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryOrderRepository implements OrderRepository {
    private final Map<String, Order> byId = new ConcurrentHashMap<>();

    public Order save(Order o) {
        byId.put(o.getId(), o);
        return o;
    }

    public Optional<Order> findById(String id) {
        return Optional.ofNullable(byId.get(id));
    }

    public Collection<Order> findAll() {
        return byId.values();
    }

    public void clear() {
        byId.clear();
    }
}

package repository.interfaces;
import domain.order.Order;
import java.util.Collection;
import java.util.Optional;
public interface OrderRepository {
    Order save(Order o);
    Optional<Order> findById(String id);
    Collection<Order> findAll();
    void clear();
}

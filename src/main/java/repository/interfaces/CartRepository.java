package repository.interfaces;
import domain.order.Cart;
import java.util.Collection;
import java.util.Optional;
public interface CartRepository {
    Cart createCart();
    Optional<Cart> findById(String id);
    Collection<Cart> findAll();
    Cart save(Cart cart);
    void delete(String id);
    void clear();
    Cart getOrCreateForUserId(String userId);
    Optional<Cart> findByUserId(String userId);
    void removeForUserId(String userId);
}

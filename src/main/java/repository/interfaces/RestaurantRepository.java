package repository.interfaces;
import domain.catalog.Restaurant;
import java.util.Collection;
import java.util.Optional;
public interface RestaurantRepository {
    Collection<Restaurant> findAll();
    Optional<Restaurant> findByName(String name);
    Restaurant save(Restaurant r);
    void clear();
}

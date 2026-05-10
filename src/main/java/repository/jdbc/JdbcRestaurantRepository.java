package repository.jdbc;

import domain.catalog.Restaurant;
import repository.interfaces.RestaurantRepository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

public class JdbcRestaurantRepository implements RestaurantRepository {
    @Override
    public Collection<Restaurant> findAll() {
        return new ArrayList<>();
    }

    @Override
    public Optional<Restaurant> findByName(String name) {
        return Optional.empty();
    }

    @Override
    public Restaurant save(Restaurant r) {
        return r;
    }

    @Override
    public void clear() {
    }
}


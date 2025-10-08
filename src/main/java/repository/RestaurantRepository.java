package repository;

import domain.Restaurant;
import domain.Dish;
import domain.DishCategory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class RestaurantRepository {
    private final Map<String, Restaurant> byName = new ConcurrentHashMap<>();

    public RestaurantRepository() {
        // adding new restaurant for test the server
        var r1 = new Restaurant("La Fabrica","Italian","$$");
        r1.addDishToMenu(new Dish("Pizza Margherita","Classic",20.0, DishCategory.MAIN_COURSE,"Pizza"));
        byName.put(r1.getName(), r1);

        var r2 = new Restaurant("Sushi World","Japanese","$$$");
        byName.put(r2.getName(), r2);
    }

    public Collection<Restaurant> findAll() {
        return byName.values();
    }

    public Optional<Restaurant> findByName(String name) {
        return Optional.ofNullable(byName.get(name));
    }

    public Restaurant save(Restaurant r) {
        byName.put(r.getName(), r);
        return r;
    }
}

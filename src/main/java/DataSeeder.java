
import domain.*;
import repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class DataSeeder {
    private DataSeeder(){}

    public static class Seed {
        public String restAId;
    }

    public static Seed resetAndSeed(CampusUserRepository users,
                                    RestaurantRepository restaurants,
                                    CartRepository carts,
                                    OrderRepository orders,
                                    DeliveryCatalogRepository delivery) {
        // curățări (adaugă clear() în repo-urile tale dacă nu există încă)
        try { users.clear(); } catch (Exception ignored) {}
        try { restaurants.clear(); } catch (Exception ignored) {}
        try { carts.clear(); } catch (Exception ignored) {}
        try { orders.clear(); } catch (Exception ignored) {}
        delivery.clear();

        // user simplu
        users.save(new CampusUser("Alice", "alice@campus", "Dorm A"));

        // restaurante – folosim ce ai deja, dar asigurăm „Restaurant A”
        Restaurant restA = new Restaurant("Restaurant A", "Italian", "$$");
        // Creezi un dish
        Dish dishA = new Dish("Pizza Margherita", "Pizza clasică cu sos de roșii și mozzarella", 8.5, DishCategory.MAIN_COURSE, "Vegetarian");

        restA.addDishToMenu(dishA);

        restaurants.save(restA);

        // locații campus (pre-înregistrate)
        delivery.addLocation(new DeliveryLocation("Bât A", "Main entrance"));
        delivery.addLocation(new DeliveryLocation("Library", "Front desk"));
        delivery.addLocation(new DeliveryLocation("Cafeteria", "Pickup zone"));

        // sloturi disponibile pentru Restaurant A
        var base = LocalDateTime.now().withHour(12).withMinute(0).withSecond(0).withNano(0);
        delivery.setSlots(restA.getId(), List.of(
                new DeliverySlot(base, 100),
                new DeliverySlot(base.plusMinutes(30), 150),
                new DeliverySlot(base.plusMinutes(60), 120)
        ));


        Seed s = new Seed();
        s.restAId = restA.getId();
        return s;
    }
}


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

        // Reset all repositories
        try { users.clear(); } catch (Exception ignored) {}
        try { restaurants.clear(); } catch (Exception ignored) {}
        try { carts.clear(); } catch (Exception ignored) {}
        try { orders.clear(); } catch (Exception ignored) {}
        delivery.clear();

        // Simple user
        CampusUser user1 = new CampusUser("Alice", "alice@campus", "Dorm A");
        users.save(user1);
        System.out.println(user1.toString());


        // Simple restaurant
        Restaurant restA = new Restaurant("Restaurant A", "Italian", "$$");

        // Add a dish to restaurant A
        Dish dishA = new Dish("Pizza Margherita",
                "Classic pizza with mozzarella and tomatoes.",
                8.5, DishCategory.MAIN_COURSE, "Vegetarian");

        restA.addDishToMenu(dishA);
        restaurants.save(restA);
        System.out.println(restA.toString());


        // Delivery catalog with pre-registered locations
        delivery.addLocation(new DeliveryLocation("Bât A", "Main entrance"));
        delivery.addLocation(new DeliveryLocation("Library", "Front desk"));
        delivery.addLocation(new DeliveryLocation("Cafeteria", "Pickup zone"));

        // Add delivery slots for restaurant A
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

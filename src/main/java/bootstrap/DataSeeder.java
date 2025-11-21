package bootstrap;

import domain.*;
import repository.*;

import java.time.LocalDateTime;
import java.util.List;

public final class DataSeeder {
    private DataSeeder(){}

    public static class Seed {
        public String restAId;
        public String restBId;
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

        CampusUser user2 = new CampusUser("Bob", "bob@campus", "Dorm B");
        users.save(user2);

        System.out.println(user1.toString());
        System.out.println(user2.toString());

        // Restaurants and dishes
        Restaurant restA = new Restaurant("Restaurant A", "Italian", "$$");
        Dish dishA = new Dish("Pizza Margherita",
                "Classic pizza with mozzarella and tomatoes.",
                8.5, DishCategory.MAIN_COURSE, "Vegetarian");
        dishA.addDietaryTag(DietaryTag.VEGETARIAN);
        restA.addDishToMenu(dishA);
        Dish pasta = new Dish("Pasta", "Fresh pasta with bolognese sos", 20.0, DishCategory.MAIN_COURSE, "Contains meat");
        pasta.addDietaryTag(DietaryTag.LACTOSE_FREE);
        restA.addDishToMenu(pasta);

        Dish lasagna = new Dish("Lasagna", "Layers of pasta with ragu and bechamel",
                12.0, DishCategory.MAIN_COURSE, "Contains gluten");
        restA.addDishToMenu(lasagna);

        Dish bruschetta = new Dish("Bruschetta", "Grilled bread with tomatoes & basil",
                6.0, DishCategory.STARTER, "Vegetarian");
        restA.addDishToMenu(bruschetta);

        Dish tiramisu = new Dish("Tiramisu", "Mascarpone & coffee dessert",
                6.5, DishCategory.DESSERT, "Contains lactose");
        restA.addDishToMenu(tiramisu);

        restaurants.save(restA);
        System.out.println(restA.toString());

        Restaurant restB = new Restaurant("Second Place", "Asian", "$$$");
        Dish dishB = new Dish("Soba",
                "Buckwheat noodles",
                9.0, DishCategory.MAIN_COURSE, "Vegan");
        dishB.addDietaryTag(DietaryTag.VEGAN);
        restB.addDishToMenu(dishB);

        Dish soba = new Dish("Udon",
                "Buckwheat noodles",
                12.0, DishCategory.MAIN_COURSE, "Vegan");
        soba.addDietaryTag(DietaryTag.VEGAN);
        restB.addDishToMenu(soba);

        Dish ramen = new Dish("Ramen", "Pork broth ramen",
                13.5, DishCategory.MAIN_COURSE, "Contains meat");
        restB.addDishToMenu(ramen);

        Dish edamame = new Dish("Edamame", "Steamed soybeans with sea salt",
                5.0, DishCategory.STARTER, "Vegan");
        restB.addDishToMenu(edamame);
        restaurants.save(restB);
        System.out.println(restB.toString());

        // Delivery catalog with pre-registered locations
        delivery.addLocation(new DeliveryLocation("Bât A", "Main entrance"));
        delivery.addLocation(new DeliveryLocation("Library", "Front desk"));
        delivery.addLocation(new DeliveryLocation("Cafeteria", "Pickup zone"));

        // Add delivery slots for both restaurants
        var base = LocalDateTime.now().plusMinutes(30).withSecond(0).withNano(0);
        delivery.setSlots(restA.getId(), List.of(
                new DeliverySlot(base, 100),
                new DeliverySlot(base.plusMinutes(30), 150),
                new DeliverySlot(base.plusMinutes(60), 120)
        ));
        delivery.setSlots(restB.getId(), List.of(
                new DeliverySlot(base.plusMinutes(15), 80),
                new DeliverySlot(base.plusMinutes(45), 90)
        ));

        Seed s = new Seed();
        s.restAId = restA.getId();
        s.restBId = restB.getId();
        return s;
    }
}

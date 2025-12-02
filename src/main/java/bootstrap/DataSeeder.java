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

    private static LocalDateTime nextHalfHourNow() {
        LocalDateTime now = LocalDateTime.now();
        int minute = now.getMinute();
        int addMinutes = minute == 0 || minute == 30
                ? 0
                : (minute < 30 ? (30 - minute) : (60 - minute));
        LocalDateTime aligned = now.plusMinutes(addMinutes).withSecond(0).withNano(0);
        if (!aligned.isAfter(now)) {
            aligned = aligned.plusMinutes(30);
        }
        return aligned;
    }

    public static Seed resetAndSeed(
            CampusUserRepository users,
            RestaurantRepository restaurants,
            CartRepository carts,
            OrderRepository orders,
            DeliveryCatalogRepository delivery
    ) {

        // ============================
        // RESET REPOS
        // ============================
        try { users.clear(); } catch (Exception ignored) {}
        try { restaurants.clear(); } catch (Exception ignored) {}
        try { carts.clear(); } catch (Exception ignored) {}
        try { orders.clear(); } catch (Exception ignored) {}
        delivery.clear();

        // ============================
        // USERS
        // ============================
        CampusUser user1 = new CampusUser("Alice", "alice@campus", "Dorm A");
        CampusUser user2 = new CampusUser("Bob", "bob@campus", "Dorm B");
        CampusUser user3 = new CampusUser("Miruna Iliescu", "miruna@iliescu.com", "Romania");
        CampusUser user4 = new CampusUser("Stefan", "stefan@campus", "Romania");

        user1.assignStudentCredit(new StudentCredit(50.0));
        user2.assignStudentCredit(new StudentCredit(30.0));
        user3.assignStudentCredit(new StudentCredit(100.0));
        user4.assignStudentCredit(new StudentCredit(0));

        users.save(user1);
        users.save(user2);
        users.save(user3);
        users.save(user4);

        System.out.println(user1);
        System.out.println(user2);
        System.out.println(user3);
        System.out.println(user4);

        // ============================
        // RESTAURANT A — Italian
        // ============================

        Restaurant restA = new Restaurant("Restaurant A", "Italian", "$$");

        Dish pizzaMargherita = new Dish(
                "Pizza Margherita",
                "Classic pizza with mozzarella and tomatoes.",
                8.5,
                DishCategory.MAIN_COURSE,
                "Vegetarian"
        );
        pizzaMargherita.addDietaryTag(DietaryTag.VEGETARIAN);
        restA.addDishToMenu(pizzaMargherita);

        // IMPORTANT pentru teste → numele EXACT: "Pasta"
        Dish pasta = new Dish(
                "Pasta",
                "Fresh pasta with bolognese sauce.",
                20.0,
                DishCategory.MAIN_COURSE,
                "Contains meat"
        );
        pasta.addDietaryTag(DietaryTag.LACTOSE_FREE);
        restA.addDishToMenu(pasta);

        Dish lasagna = new Dish(
                "Lasagna",
                "Layers of pasta with ragu and béchamel.",
                12.0,
                DishCategory.MAIN_COURSE,
                "Contains gluten"
        );
        restA.addDishToMenu(lasagna);

        Dish bruschetta = new Dish(
                "Bruschetta",
                "Grilled bread with tomatoes & basil.",
                6.0,
                DishCategory.STARTER,
                "Vegetarian"
        );
        bruschetta.addDietaryTag(DietaryTag.VEGETARIAN);
        restA.addDishToMenu(bruschetta);

        Dish tiramisu = new Dish(
                "Tiramisu",
                "Mascarpone & coffee dessert.",
                6.5,
                DishCategory.DESSERT,
                "Contains lactose"
        );
        restA.addDishToMenu(tiramisu);

        restaurants.save(restA);
        System.out.println(restA);

        // ============================
        // RESTAURANT B — Asian
        // ============================

        Restaurant restB = new Restaurant("Second Place", "Asian", "$$$");

        Dish soba = new Dish(
                "Soba",
                "Buckwheat noodles with light soy broth.",
                9.0,
                DishCategory.MAIN_COURSE,
                "Vegan"
        );
        soba.addDietaryTag(DietaryTag.VEGAN);
        restB.addDishToMenu(soba);

        Dish udon = new Dish(
                "Udon",
                "Thick wheat noodles in dashi broth.",
                12.0,
                DishCategory.MAIN_COURSE,
                "Vegan"
        );
        udon.addDietaryTag(DietaryTag.VEGAN);
        restB.addDishToMenu(udon);

        Dish ramen = new Dish(
                "Ramen",
                "Pork broth ramen with egg & veggies.",
                13.5,
                DishCategory.MAIN_COURSE,
                "Contains meat"
        );
        restB.addDishToMenu(ramen);

        Dish edamame = new Dish(
                "Edamame",
                "Steamed soybeans with sea salt.",
                5.0,
                DishCategory.STARTER,
                "Vegan"
        );
        edamame.addDietaryTag(DietaryTag.VEGAN);
        restB.addDishToMenu(edamame);

        restaurants.save(restB);
        System.out.println(restB);

        // ============================
        // RESTAURANT C — Green Garden (Vegetarian)
        // ============================

        Restaurant restC = new Restaurant("Green Garden", "Vegetarian", "$$");

        Dish buddhaBowl = new Dish(
                "Buddha Bowl",
                "Quinoa, roasted veggies & hummus.",
                10.5,
                DishCategory.MAIN_COURSE,
                "Vegetarian, gluten-free"
        );
        buddhaBowl.addDietaryTag(DietaryTag.VEGETARIAN);
        buddhaBowl.addDietaryTag(DietaryTag.GLUTEN_FREE);
        restC.addDishToMenu(buddhaBowl);

        // IMPORTANT pentru teste → numele EXACT: "Veggie Burger"
        Dish veggieBurger = new Dish(
                "Veggie Burger",
                "Grilled veggie patty with salad & fries.",
                9.5,
                DishCategory.MAIN_COURSE,
                "Vegetarian"
        );
        veggieBurger.addDietaryTag(DietaryTag.VEGETARIAN);
        restC.addDishToMenu(veggieBurger);

        Dish caesarSalad = new Dish(
                "Caesar Salad",
                "Crisp lettuce, parmesan & croutons.",
                8.0,
                DishCategory.MAIN_COURSE,
                "Contains lactose, gluten"
        );
        restC.addDishToMenu(caesarSalad);

        Dish chiaPudding = new Dish(
                "Chia Pudding",
                "Coconut milk, chia seeds & red fruits.",
                5.5,
                DishCategory.DESSERT,
                "Vegan, gluten-free"
        );
        chiaPudding.addDietaryTag(DietaryTag.VEGAN);
        chiaPudding.addDietaryTag(DietaryTag.GLUTEN_FREE);
        restC.addDishToMenu(chiaPudding);

        restaurants.save(restC);
        System.out.println(restC);

        // ============================
        // RESTAURANT D — Burger Hub (Fast food)
        // ============================

        Restaurant restD = new Restaurant("Burger Hub", "Fast food", "$");

        Dish classicBurger = new Dish(
                "Classic Burger",
                "Beef patty, cheddar, lettuce & tomato.",
                8.0,
                DishCategory.MAIN_COURSE,
                "Contains meat, lactose"
        );
        restD.addDishToMenu(classicBurger);

        Dish chickenBurger = new Dish(
                "Crispy Chicken Burger",
                "Fried chicken, coleslaw & pickles.",
                8.5,
                DishCategory.MAIN_COURSE,
                "Contains meat"
        );
        restD.addDishToMenu(chickenBurger);

        Dish fries = new Dish(
                "French Fries",
                "Crispy golden fries.",
                3.0,
                DishCategory.STARTER,
                "Vegan"
        );
        fries.addDietaryTag(DietaryTag.VEGAN);
        restD.addDishToMenu(fries);

        Dish brownie = new Dish(
                "Chocolate Brownie",
                "Warm brownie with chocolate chips.",
                4.0,
                DishCategory.DESSERT,
                "Contains lactose, gluten"
        );
        restD.addDishToMenu(brownie);

        restaurants.save(restD);
        System.out.println(restD);

        // ============================
        // DELIVERY LOCATIONS
        // ============================

        delivery.addLocation(new DeliveryLocation("Bât A", "Main entrance"));
        delivery.addLocation(new DeliveryLocation("Library", "Front desk"));
        delivery.addLocation(new DeliveryLocation("Cafeteria", "Pickup zone"));
        delivery.addLocation(new DeliveryLocation("Sports Hall", "Side entrance"));

        // ============================
        // DELIVERY SLOTS
        // ============================

        LocalDateTime base = nextHalfHourNow();

// Restaurant A – large capacity slots
        delivery.setSlots(restA.getId(), List.of(
                new DeliverySlot(base, 100),
                new DeliverySlot(base.plusMinutes(30), 10),
                new DeliverySlot(base.plusMinutes(60), 60)
        ));

// Second Place – slightly shifted
        delivery.setSlots(restB.getId(), List.of(
                new DeliverySlot(base.plusMinutes(15), 60),
                new DeliverySlot(base.plusMinutes(45), 40)
        ));

// Green Garden – later lunch
        delivery.setSlots(restC.getId(), List.of(
                new DeliverySlot(base.plusHours(1), 50),
                new DeliverySlot(base.plusHours(1).plusMinutes(30), 50)
        ));

// Burger Hub – evening slots
        delivery.setSlots(restD.getId(), List.of(
                new DeliverySlot(base.plusHours(4).plusMinutes(15), 80),
                new DeliverySlot(base.plusHours(4).plusMinutes(45), 80)
        ));

        // ============================
        // RETURN SEED IDS (cele folosite de teste)
        // ============================

        Seed s = new Seed();
        s.restAId = restA.getId();
        s.restBId = restB.getId();
        return s;
    }
}

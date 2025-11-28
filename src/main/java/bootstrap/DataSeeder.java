package bootstrap;

import domain.*;
import repository.*;

import java.time.LocalDateTime;
import java.util.List;

public final class DataSeeder {
    private DataSeeder() {}

    public static class Seed {
        public String restAId;
        public String restBId;
    }

    public static Seed resetAndSeed(CampusUserRepository users,
                                    RestaurantRepository restaurants,
                                    CartRepository carts,
                                    OrderRepository orders,
                                    DeliveryCatalogRepository delivery) {

        // -------- RESET REPOS --------
        try { users.clear(); } catch (Exception ignored) {}
        try { restaurants.clear(); } catch (Exception ignored) {}
        try { carts.clear(); } catch (Exception ignored) {}
        try { orders.clear(); } catch (Exception ignored) {}
        delivery.clear();

        // -------- USERS --------
        CampusUser user1 = new CampusUser("Alice", "alice@campus", "Dorm A");
        users.save(user1);

        CampusUser user2 = new CampusUser("Bob", "bob@campus", "Dorm B");
        users.save(user2);

        CampusUser user3 = new CampusUser("Miruna Iliescu", "miruna@iliescu.com", "Romania");
        users.save(user3);

        System.out.println(user1);
        System.out.println(user2);
        System.out.println(user3);

        // -------- RESTAURANTS & DISHES --------

        // 1) Italian – Restaurant A
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

        // IMPORTANT: numele trebuie să fie EXACT "Pasta" (testele caută asta)
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

        // 2) Asian – Second Place
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

        // 3) Vegetarian / Healthy – Green Garden
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

        // IMPORTANT: "Veggie Burger" – testele îl folosesc
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

        // 4) Fast-food / Snacks – Burger Hub
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

        // -------- DELIVERY LOCATIONS --------
        delivery.addLocation(new DeliveryLocation("Bât A", "Main entrance"));
        delivery.addLocation(new DeliveryLocation("Library", "Front desk"));
        delivery.addLocation(new DeliveryLocation("Cafeteria", "Pickup zone"));
        delivery.addLocation(new DeliveryLocation("Sports Hall", "Side entrance"));

        // -------- DELIVERY SLOTS --------
        // bază de timp pentru demo
        var base = LocalDateTime.of(2025, 11, 30, 12, 30);

        // Restaurant A – mai multe sloturi, capacitate mare
        delivery.setSlots(restA.getId(), List.of(
                new DeliverySlot(base, 100),
                new DeliverySlot(base.plusMinutes(30), 80),
                new DeliverySlot(base.plusMinutes(60), 60)
        ));

        // Second Place – sloturi puțin decalate
        delivery.setSlots(restB.getId(), List.of(
                new DeliverySlot(base.plusMinutes(15), 60),
                new DeliverySlot(base.plusMinutes(45), 40)
        ));

        // Green Garden – sloturi pentru prânz
        delivery.setSlots(restC.getId(), List.of(
                new DeliverySlot(base.plusHours(1), 50),
                new DeliverySlot(base.plusHours(1).plusMinutes(30), 50)
        ));

        // Burger Hub – sloturi mai spre seară
        delivery.setSlots(restD.getId(), List.of(
                new DeliverySlot(base.plusHours(2), 80),
                new DeliverySlot(base.plusHours(2).plusMinutes(30), 80)
        ));

        // -------- SEED RETURN --------
        Seed s = new Seed();
        s.restAId = restA.getId();
        s.restBId = restB.getId();
        return s;
    }
}

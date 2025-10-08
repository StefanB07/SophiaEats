import com.sun.net.httpserver.HttpServer;

import domain.*;
import handlers.*;
import repository.*;
import service.OrderService;

import java.util.List;
import java.net.InetSocketAddress;

public class Main {

    public static void main(String[] args) throws Exception {

        // 🔹 Server HTTP (opțional, pentru context)
        var server = HttpServer.create(new InetSocketAddress(8080), 0);
        var restaurantRepo = new RestaurantRepository();
        var cartRepo = new CartRepository();
        var userRepo = new CampusUserRepository();

        server.createContext("/restaurants", new RestaurantHandler(restaurantRepo));
        server.createContext("/cart", new CartHandler(cartRepo, restaurantRepo));
        server.createContext("/users", new CampusUserHandler(userRepo));
        var orderRepo = new OrderRepository();
        var orderService = new OrderService();
        server.createContext("/orders", new OrderHandler(cartRepo, orderRepo, orderService));
        server.setExecutor(null);
        server.start();

        System.out.println("HTTP server on http://localhost:8080");

        // ===========================================================
        // 1️⃣ Creăm restaurantele de test (diverse combinații)
        // ===========================================================
        RestaurantRepository repo = new RestaurantRepository();

        // Italian, mediu, gluten-free
        Restaurant pastaHouse = new Restaurant("Pasta House", "Italian", "restaurant", "medium", true, 10);
        Dish spaghetti = new Dish("Spaghetti", "Pasta with tomato sauce", 10.5, DishCategory.MAIN, "Pasta");
        spaghetti.addDietaryTag(DietaryTag.GLUTEN_FREE);
        pastaHouse.addDishToMenu(spaghetti);
        repo.save(pastaHouse);

        // French, cheap, fără taguri
        Restaurant leCroissant = new Restaurant("Le Croissant", "French", "crous", "cheap", true, 10);
        Dish baguette = new Dish("Baguette", "French bread", 3.0, DishCategory.STARTER, "Bread");
        leCroissant.addDishToMenu(baguette);
        repo.save(leCroissant);

        // Vegan, cheap, foodtruck
        Restaurant veganTruck = new Restaurant("Vegan Truck", "Vegan", "foodtruck", "cheap", false, 5);
        Dish veganBowl = new Dish("Vegan Bowl", "Healthy and green", 9.0, DishCategory.MAIN, "Salad");
        veganBowl.addDietaryTag(DietaryTag.VEGAN);
        veganTruck.addDishToMenu(veganBowl);
        repo.save(veganTruck);

        // French, expensive, restaurant închis
        Restaurant fancyBistro = new Restaurant("Fancy Bistro", "French", "restaurant", "expensive", false, 5);
        Dish steak = new Dish("Steak", "Medium-rare beef", 25.0, DishCategory.MAIN, "Steak");
        fancyBistro.addDishToMenu(steak);
        repo.save(fancyBistro);

        // ===========================================================
        // 2️⃣ Teste funcționale (criterii diferite)
        // ===========================================================
        System.out.println("\n=== TESTE DE FILTRARE RESTAURANTE ===");

        // Test 1: Italian + gluten-free + available
        FilterCriteria test1 = new FilterCriteria();
        test1.setCuisineType("Italian");
        test1.setDietaryTag("gluten-free");
        test1.setOnlyAvailable(true);
        runFilterTest("Cuisine=Italian + Dietary=gluten-free + Available", test1, repo);

        // Test 2: French + cheap
        FilterCriteria test2 = new FilterCriteria();
        test2.setCuisineType("French");
        test2.setPriceRange("cheap");
        runFilterTest("Cuisine=French + Price=cheap", test2, repo);

        // Test 3: Foodtruck + available
        FilterCriteria test3 = new FilterCriteria();
        test3.setEstablishmentType("foodtruck");
        test3.setOnlyAvailable(true);
        runFilterTest("Type=foodtruck + Available=true", test3, repo);

        // Test 4: Restaurant + expensive
        FilterCriteria test4 = new FilterCriteria();
        test4.setEstablishmentType("restaurant");
        test4.setPriceRange("expensive");
        runFilterTest("Type=restaurant + Price=expensive", test4, repo);

        // Test 5: doar restaurante deschise
        FilterCriteria test5 = new FilterCriteria();
        test5.setOnlyAvailable(true);
        runFilterTest("Available=true", test5, repo);

        // ===========================================================
        // 3️⃣ Teste de edge cases (situații-limită)
        // ===========================================================
        // Test 6: fără criterii (toate restaurantele)
        FilterCriteria test6 = new FilterCriteria();
        runFilterTest("No criteria (should list all)", test6, repo);

        // Test 7: tag inexistent
        FilterCriteria test7 = new FilterCriteria();
        test7.setDietaryTag("no-such-tag");
        runFilterTest("Invalid tag", test7, repo);

        // Test 8: cuisine inexistent
        FilterCriteria test8 = new FilterCriteria();
        test8.setCuisineType("Martian");
        runFilterTest("Invalid cuisine", test8, repo);

        // Test 9: combinație imposibilă
        FilterCriteria test9 = new FilterCriteria();
        test9.setCuisineType("French");
        test9.setDietaryTag("gluten-free");
        runFilterTest("Impossible combination", test9, repo);

        // Test 10: restaurant închis, dar cu capacitate 0 (verificare hasAvailableCapacity)
        Restaurant closedFull = new Restaurant("Closed Full", "Italian", "restaurant", "medium", false, 0);
        repo.save(closedFull);
        FilterCriteria test10 = new FilterCriteria();
        test10.setCuisineType("Italian");
        test10.setOnlyAvailable(true);
        runFilterTest("Closed Italian restaurant (should not appear)", test10, repo);
    }

    // ===========================================================
    // 🔹 Metodă comună de filtrare și afișare a rezultatelor
    // ===========================================================
    private static void runFilterTest(String testName, FilterCriteria criteria, RestaurantRepository repo) {
        List<Restaurant> filtered = repo.findAll().stream()
                .filter(r -> !criteria.isOnlyAvailable() || (r.isOpen() && r.hasAvailableCapacity()))
                .filter(r -> criteria.getCuisineType().isEmpty() ||
                        r.getCuisineType().equalsIgnoreCase(criteria.getCuisineType().get()))
                .filter(r -> criteria.getDietaryTag().isEmpty() ||
                        r.offersDietaryTag(criteria.getDietaryTag().get()))
                .filter(r -> criteria.getPriceRange().isEmpty() ||
                        r.getPriceRange().equalsIgnoreCase(criteria.getPriceRange().get()))
                .filter(r -> criteria.getEstablishmentType().isEmpty() ||
                        r.getType().equalsIgnoreCase(criteria.getEstablishmentType().get()))
                .toList();

        System.out.println("\n--- Test: " + testName + " ---");
        if (filtered.isEmpty()) {
            System.out.println("❌ Niciun restaurant nu corespunde criteriilor.");
        } else {
            filtered.forEach(r -> {
                String tags = "(no menu)";
                if (!r.getMenu().isEmpty()) {
                    tags = r.getMenu().get(0).getDietaryTags().toString();
                }
                System.out.println("✅ " + r.getName() +
                        " | Cuisine: " + r.getCuisineType() +
                        " | Type: " + r.getType() +
                        " | Price: " + r.getPriceRange() +
                        " | Open: " + r.isOpen() +
                        " | Tags: " + tags);
            });
        }
    }
}

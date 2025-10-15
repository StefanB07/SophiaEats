import com.sun.net.httpserver.HttpServer;

import domain.*;
import handlers.*;
import repository.*;
import service.CartService;
import service.OrderDraftService;
import service.OrderService;

import java.net.InetSocketAddress;
import java.time.LocalDateTime;

//public class Main {
//
//    public static void main(String[] args) throws Exception {
//
//        var server = HttpServer.create(new InetSocketAddress(8080), 0);
//        var restaurantRepo = new RestaurantRepository();
//
//        var cartRepo = new CartRepository();
//        var userRepo = new CampusUserRepository();
//
//        server.createContext("/restaurants", new RestaurantHandler(restaurantRepo));
//        server.createContext("/cart", new CartHandler(cartRepo, restaurantRepo));
//        server.createContext("/users", new CampusUserHandler(userRepo));
//        var orderRepo = new OrderRepository();
//        var orderService = new OrderService();
//
//        server.createContext("/orders", new OrderHandler(cartRepo, orderRepo, orderService));
//        server.setExecutor(null);
//        server.start();
//
//        System.out.println("HTTP server on http://localhost:8080");
//    }
//}


//public class Main {
//    public static void main(String[] args) {
//        // 1) Wiring
//        CampusUserRepository users = new CampusUserRepository();
//        RestaurantRepository restaurants = new RestaurantRepository();
//        CartRepository carts = new CartRepository();
//        OrderRepository orders = new OrderRepository();
//        DeliveryCatalogRepository delivery = new DeliveryCatalogRepository();
//
//        // 2) Seed
//        DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);
//
//        // 3) Services
//        CartService cartService = new CartService(carts, restaurants);
//        OrderService orderService = new OrderService(); // conform semnăturii tale
//
//        // 4) Search a restaurant
//        Restaurant restaurant = restaurants.findByName("Restaurant A")
//                .orElseGet(() -> restaurants.findAll().stream()
//                        .findFirst()
//                        .orElseThrow(() -> new IllegalStateException("No restaurants seeded!")));
//
//        // 5) Choose a dish
//        if (restaurant.getMenu().isEmpty()) {
//            throw new IllegalStateException("Restaurant has no dishes! Add some in DataSeeder.");
//        }
//        Dish dish = restaurant.getMenu().get(0);
//
//        // 6) Add to cart
//        Cart cart = carts.getDemoCart();
//        cartService.addItem(cart, restaurant, dish, 2);
//        System.out.println("Cart after add: " + cart.getItems());
//
//        // 7) Delivery details
//        LocalDateTime deliveryTime = LocalDateTime.now().plusMinutes(30);
//        String deliveryPlace = "Bât A";
//
//        // 8) Place the order
//        Order order = orderService.placeOrder(cart, deliveryPlace, deliveryTime);
//
//        // 9) Print order details
//        System.out.println("    Order created: " + order.getId());
//        System.out.println("    Delivery place: " + order.getDeliveryPlace());
//        System.out.println("    Delivery time: " + order.getDeliveryTime());
//        System.out.println("    Items: " + order.getItems());
//        System.out.println("    Status: " + order.getStatus());
//    }
//}

public class Main {
    private static void title(String txt) { System.out.println("\n==== " + txt + " ===="); }
    private static void ok(String msg)    { System.out.println("✅ " + msg); }
    private static void fail(String msg)  { System.out.println("❌ " + msg); }
    private static void warn(String msg)  { System.out.println("⚠️  " + msg); }

    public static void main(String[] args) {
        // 1) Wiring
        CampusUserRepository users = new CampusUserRepository();
        RestaurantRepository restaurants = new RestaurantRepository();
        CartRepository carts = new CartRepository();
        OrderRepository orders = new OrderRepository();
        DeliveryCatalogRepository delivery = new DeliveryCatalogRepository();

        // 2) Seed
        DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);

        // 3) Services
        CartService cartService = new CartService(carts, restaurants);
//        OrderService orderService = new OrderService(); // semnătura ta: placeOrder(Cart, String, LocalDateTime)
        OrderService orderService = new OrderService(delivery, restaurants);


        // 4) Search a restaurant
        Restaurant restaurant = restaurants.findByName("Restaurant A")
                .orElseGet(() -> restaurants.findAll().stream()
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("No restaurants seeded!")));

        // 5) Choose a dish
        if (restaurant.getMenu().isEmpty()) {
            throw new IllegalStateException("Restaurant has no dishes! Add some in DataSeeder.");
        }
        Dish dish = restaurant.getMenu().get(0);

        // 6) Add to cart
        Cart cart = carts.createCart();
        cartService.addItem(cart, restaurant, dish, 2);
        System.out.println("Cart after add: " + cart.getItems());

        // 7) Delivery details
        LocalDateTime deliveryTime = LocalDateTime.now().plusMinutes(30);
        String deliveryPlace = "Bât A";

        // 8) Place the order (HAPPY PATH)
        title("Happy path: place order");
        Order order = orderService.placeOrder(cart, deliveryPlace, deliveryTime);
        System.out.println("    Order created: " + order.getId());
        System.out.println("    Delivery place: " + order.getDeliveryPlace());
        System.out.println("    Delivery time: " + order.getDeliveryTime());
        System.out.println("    Items: " + order.getItems());
        System.out.println("    Status: " + order.getStatus());
        ok("Happy path done");

        // EDGE CASES
        // Helper: reset cart
        cart.clear();

        // Edge B) Invalid delivery location
        title("Edge B: Invalid delivery location");
        try {
            // Adding again items to cart
            cartService.addItem(cart, restaurant, dish, 1);
            orderService.placeOrder(cart, "Unknown Building", LocalDateTime.now().plusMinutes(30));
            warn("OrderService did NOT reject invalid location (implementation-dependent).");
        } catch (IllegalArgumentException e) {
            ok("Rejected invalid location: " + e.getMessage());
        } catch (Exception e) {
            warn("Different exception: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        } finally {
            cart.clear();
        }

        // Edge C) Delivery time in the past
        title("Edge C: Delivery time in the past");
        try {
            cartService.addItem(cart, restaurant, dish, 1);
            orderService.placeOrder(cart, "Bât A", LocalDateTime.now().minusHours(1));
            fail("Expected rejection for past delivery time.");
        } catch (IllegalArgumentException | IllegalStateException e) {
            ok("Rejected past time: " + e.getMessage());
        } finally {
            cart.clear();
        }

        // Edge D) Cart empty
        title("Edge D: Empty cart");
        try {
            orderService.placeOrder(cart, "Bât A", LocalDateTime.now().plusMinutes(30));
            fail("Expected rejection for empty cart.");
        } catch (IllegalArgumentException | IllegalStateException e) {
            ok("Rejected empty cart: " + e.getMessage());
        } finally {
            cart.clear();
        }

        // Edge E) Mixed restaurants in the same cart
        title("Edge E: Mixed restaurants in one cart");
        try {
            // 1) Add a dish from restA
            cartService.addItem(cart, restaurant, dish, 1);

            // 2) Create another restaurant with a dish
            Restaurant restB = new Restaurant("Second Place", "Asian", "$$");
            Dish dishB = new Dish("Soba", "Buckwheat noodles", 9.0, DishCategory.MAIN_COURSE, "Vegan");
            restB.addDishToMenu(dishB);
            restaurants.save(restB);

            // 3) Add a dish from restB
            cartService.addItem(cart, restB, dishB, 1);

            // 4) Place the order - should be rejected
            Order mixedOrder = orderService.placeOrder(cart, "Bât A", LocalDateTime.now().plusMinutes(30));
            fail("Expected rejection for mixed restaurants, but got order: " + mixedOrder.getId());
        } catch (IllegalArgumentException | IllegalStateException e) {
            ok("Rejected mixed restaurants: " + e.getMessage());
        } finally {
            cart.clear();
        }

        System.out.println("\nAll scenarios executed.\n");
    }
}
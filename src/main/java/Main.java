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


public class Main {
    public static void main(String[] args) {
        // 1) Wiring
        CampusUserRepository users = new CampusUserRepository();
        RestaurantRepository restaurants = new RestaurantRepository();
        CartRepository carts = new CartRepository();
        OrderRepository orders = new OrderRepository();
        DeliveryCatalogRepository delivery = new DeliveryCatalogRepository();

        // 2) Seed
        DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);

        // 3) Servicii
        CartService cartService = new CartService(carts, restaurants);
        OrderService orderService = new OrderService(); // conform semnăturii tale

        // 4) Caut restaurantul
        Restaurant restaurant = restaurants.findByName("Restaurant A")
                .orElseGet(() -> restaurants.findAll().stream()
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("No restaurants seeded!")));

        // 5) Aleg un dish
        if (restaurant.getMenu().isEmpty()) {
            throw new IllegalStateException("Restaurantul nu are dish-uri. Adaugă în DataSeeder!");
        }
        Dish dish = restaurant.getMenu().get(0);

        // 6) Adaug în coș
        Cart cart = carts.getDemoCart();                  // repo-ul tău expune demoCart
        cartService.addItem(cart, restaurant, dish, 2);   // 2 bucăți
        System.out.println("Cart after add: " + cart.getItems());

        // 7) Ora de livrare (preferabil din catalogul de sloturi dacă ai label-ul)
        LocalDateTime deliveryTime = LocalDateTime.now().plusMinutes(30);
        String deliveryPlace = "Bât A";

        // 8) Plasez comanda (semnătură: Cart, String, LocalDateTime)
        Order order = orderService.placeOrder(cart, deliveryPlace, deliveryTime);

        // 9) Rezultat
        System.out.println("✅ Order created: " + order.getId());
        System.out.println("Delivery place: " + order.getDeliveryPlace());
        System.out.println("Delivery time: " + order.getDeliveryTime());
        System.out.println("Items: " + order.getItems());
        System.out.println("Status: " + order.getStatus());
    }
}


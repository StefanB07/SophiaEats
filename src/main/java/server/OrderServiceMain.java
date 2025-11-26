package server;

import com.sun.net.httpserver.HttpServer;
import handlers.OrderApiHandler;
import repository.*;
import service.CartService;
import service.CatalogService;
import service.OrderService;
import bootstrap.DataSeeder;
import handlers.UsersApiHandler;


import java.io.IOException;
import java.net.InetSocketAddress;

public class OrderServiceMain {
    public static void main(String[] args) throws IOException {
        int port = 8082;

        // Repositories
        RestaurantRepository restaurants = new RestaurantRepository();
        CampusUserRepository users = new CampusUserRepository();
        CartRepository carts = new CartRepository();
        OrderRepository orders = new OrderRepository();
        DeliveryCatalogRepository delivery = new DeliveryCatalogRepository();

        // Seed shared demo data
        DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);

        // Services
        CartService cartService = new CartService(carts, restaurants);
        OrderService orderService = new OrderService(delivery, restaurants);
        CatalogService catalogService = new CatalogService(restaurants, delivery);

        // Handler
        OrderApiHandler handler = new OrderApiHandler(cartService, orderService, orders, catalogService);

        // Handler for /api/users
        UsersApiHandler usersHandler = new UsersApiHandler(users);

        // HTTP server
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/cart", handler);
        server.createContext("/orders", handler);

        // Add contexts for /users and /api/users
        server.createContext("/users", usersHandler);
        server.createContext("/api/users", usersHandler);

        server.createContext("/health", ex -> {
            if ("GET".equalsIgnoreCase(ex.getRequestMethod())) {
                String body = "{\"status\":\"UP\"}";
                ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
                ex.sendResponseHeaders(200, body.getBytes().length);
                try (var os = ex.getResponseBody()) { os.write(body.getBytes()); }
            } else {
                String err = "{\"error\":\"Method Not Allowed\",\"status\":405}";
                ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
                ex.sendResponseHeaders(405, err.getBytes().length);
                try (var os = ex.getResponseBody()) { os.write(err.getBytes()); }
            }
        });
        server.setExecutor(null);

        System.out.println("OrderService listening on http://localhost:" + port);
        server.start();
    }
}

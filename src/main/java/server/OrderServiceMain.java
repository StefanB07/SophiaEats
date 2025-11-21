package server;

import com.sun.net.httpserver.HttpServer;
import handlers.OrderApiHandler;
import repository.*;
import service.CatalogService;
import service.CartService;
import service.OrderService;
import bootstrap.DataSeeder;

import java.io.IOException;
import java.net.InetSocketAddress;

public class OrderServiceMain {
    public static void main(String[] args) throws IOException {
        int port = 8082;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Instantiate repositories
        CampusUserRepository users = new CampusUserRepository();
        RestaurantRepository restaurants = new RestaurantRepository();
        CartRepository carts = new CartRepository();
        OrderRepository orders = new OrderRepository();
        DeliveryCatalogRepository delivery = new DeliveryCatalogRepository();

        // Seed data consistently across services (in-memory for demo)
        DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);

        // Services
        CatalogService catalogService = new CatalogService(restaurants);
        CartService cartService = new CartService(carts, restaurants);
        OrderService orderService = new OrderService(delivery, restaurants);

        // Single handler for all order-related APIs
        OrderApiHandler api = new OrderApiHandler(cartService, orderService, orders, catalogService);

        server.createContext("/cart", api);
        server.createContext("/orders", api);

        server.setExecutor(null);
        System.out.println("OrderService listening on http://localhost:" + port);
        server.start();
    }
}

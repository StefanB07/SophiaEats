package server;

import com.sun.net.httpserver.HttpServer;
import handlers.CatalogApiHandler;
import repository.RestaurantRepository;
import repository.CartRepository;
import repository.OrderRepository;
import repository.DeliveryCatalogRepository;
import repository.CampusUserRepository;
import service.CatalogService;
import bootstrap.DataSeeder;

import java.io.IOException;
import java.net.InetSocketAddress;

public class CatalogServiceMain {
    public static void main(String[] args) throws IOException {
        int port = 8081;

        // Repos locale (in-memory)
        RestaurantRepository restaurantRepository = new RestaurantRepository();
        CampusUserRepository users = new CampusUserRepository();
        CartRepository carts = new CartRepository();
        OrderRepository orders = new OrderRepository();
        DeliveryCatalogRepository delivery = new DeliveryCatalogRepository();

        // Common data seeding for all services (avoiding divergence)
        DataSeeder.resetAndSeed(users, restaurantRepository, carts, orders, delivery);

        // Service + handler
        CatalogService catalogService = new CatalogService(restaurantRepository);
        CatalogApiHandler handler = new CatalogApiHandler(catalogService);

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        // only one context runs /restaurants, /restaurants/filter, /restaurants/{name}
        server.createContext("/restaurants", handler);
        server.setExecutor(null);

        System.out.println("CatalogService listening on http://localhost:" + port);
        server.start();
    }
}


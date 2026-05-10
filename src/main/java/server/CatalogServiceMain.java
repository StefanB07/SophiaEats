package server;
import repository.interfaces.RestaurantRepository;
import repository.interfaces.OrderRepository;
import repository.interfaces.DeliveryCatalogRepository;
import repository.interfaces.CartRepository;
import repository.interfaces.CampusUserRepository;

import com.sun.net.httpserver.HttpServer;
import handlers.CatalogApiHandler;
import repository.interfaces.RestaurantRepository;
import repository.interfaces.CartRepository;
import repository.interfaces.OrderRepository;
import repository.interfaces.DeliveryCatalogRepository;
import repository.interfaces.CampusUserRepository;
import service.CatalogService;
import bootstrap.DataSeeder;

import java.io.IOException;
import java.net.InetSocketAddress;

public class CatalogServiceMain {
    public static void main(String[] args) throws IOException {
        int port = 8081;

        // Repos locale (in-memory)
        RestaurantRepository restaurantRepository = new repository.InMemoryRestaurantRepository();
        CampusUserRepository users = new repository.InMemoryCampusUserRepository();
        CartRepository carts = new repository.InMemoryCartRepository();
        OrderRepository orders = new repository.InMemoryOrderRepository();
        DeliveryCatalogRepository delivery = new repository.InMemoryDeliveryCatalogRepository();

        // Common data seeding for all services (avoiding divergence)
        DataSeeder.resetAndSeed(users, restaurantRepository, carts, orders, delivery);

        // Service + handler
        CatalogService catalogService = new CatalogService(restaurantRepository, delivery);
        CatalogApiHandler handler = new CatalogApiHandler(catalogService);

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        // Only one context for /restaurants, /restaurants/filter, /restaurants/{name}
        server.createContext("/restaurants", handler);
        server.createContext("/delivery", handler);
        server.setExecutor(null);

        // Health check endpoint
        server.createContext("/health", ex -> {
            if ("GET".equalsIgnoreCase(ex.getRequestMethod())) {
                String body = "{\"status\":\"UP\"}";
                ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
                ex.sendResponseHeaders(200, body.getBytes().length);
                try (var os = ex.getResponseBody()) {
                    os.write(body.getBytes());
                }
            } else {
                String err = "{\"error\":\"Method Not Allowed\",\"status\":405}";
                ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
                ex.sendResponseHeaders(405, err.getBytes().length);
                try (var os = ex.getResponseBody()) {
                    os.write(err.getBytes());
                }
            }
        });


        System.out.println("CatalogService listening on http://localhost:" + port);
        server.start();
    }
}



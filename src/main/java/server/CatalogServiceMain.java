package server;

import com.sun.net.httpserver.HttpServer;
import handlers.CatalogApiHandler;
import repository.RestaurantRepository;
import bootstrap.DataSeeder;
import repository.*;
import service.CatalogService;

import java.io.IOException;
import java.net.InetSocketAddress;

public class CatalogServiceMain {
    public static void main(String[] args) throws IOException {
        int port = 8081;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Repos for catalog
        RestaurantRepository restaurantRepository = new RestaurantRepository();
        // Seed using the same seeder as other services for consistency
        DataSeeder.resetAndSeed(new CampusUserRepository(), restaurantRepository,
                new CartRepository(), new OrderRepository(), new DeliveryCatalogRepository());

        // Service + single handler
        CatalogService catalogService = new CatalogService(restaurantRepository);
        CatalogApiHandler handler = new CatalogApiHandler(catalogService);

        // One context is enough; it will handle /restaurants, /restaurants/filter, /restaurants/{name}
        server.createContext("/restaurants", handler);

        server.setExecutor(null); // default executor (multi-threaded)
        System.out.println("CatalogService listening on http://localhost:" + port);
        server.start();
    }
}

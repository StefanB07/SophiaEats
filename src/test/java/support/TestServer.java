package support;

import com.sun.net.httpserver.HttpServer;
import bootstrap.DataSeeder;
import domain.Dish;
import domain.DishCategory;
import domain.Restaurant;
import handlers.CatalogApiHandler;
import handlers.OrderApiHandler;
import repository.CampusUserRepository;
import repository.CartRepository;
import repository.DeliveryCatalogRepository;
import repository.OrderRepository;
import repository.RestaurantRepository;
import service.CartService;
import service.CatalogService;
import service.OrderService;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;

public final class TestServer {
    private static HttpServer server;
    private static int port;
    public static void start() throws IOException {
        if (server != null) return;
        server = HttpServer.create(new InetSocketAddress(0), 0);

        RestaurantRepository restaurantRepo = new RestaurantRepository();
        CampusUserRepository userRepo = new CampusUserRepository();
        CartRepository cartRepo = new CartRepository();
        OrderRepository orderRepo = new OrderRepository();
        DeliveryCatalogRepository deliveryRepo = new DeliveryCatalogRepository();

        DataSeeder.resetAndSeed(userRepo, restaurantRepo, cartRepo, orderRepo, deliveryRepo);

        if (restaurantRepo.findByName("La Fabrica").isEmpty()) {
            Restaurant laFabrica = new Restaurant("La Fabrica", "Italian", "$$");
            laFabrica.addDishToMenu(new Dish("Pizza Margherita", "Classic", 20.0, DishCategory.MAIN_COURSE, "Pizza"));
            restaurantRepo.save(laFabrica);
        }

        CartService cartService = new CartService(cartRepo, restaurantRepo);
        OrderService orderService = new OrderService(deliveryRepo, restaurantRepo);
        CatalogService catalogService = new CatalogService(restaurantRepo);

        OrderApiHandler orderApiHandler = new OrderApiHandler(cartService, orderService, orderRepo, catalogService);
        CatalogApiHandler catalogApiHandler = new CatalogApiHandler(catalogService);

        server.createContext("/cart", orderApiHandler);
        server.createContext("/cart/items", orderApiHandler);
        server.createContext("/orders", orderApiHandler);
        server.createContext("/restaurants", catalogApiHandler);

        server.setExecutor(null);
        server.start();
        port = server.getAddress().getPort();
    }

    public static int port() {
        return port;
    }

    public static URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }

    public static void stop() {
        if (server != null) {
            server.stop(0);
            server = null;
            port = 0;
        }
    }
}

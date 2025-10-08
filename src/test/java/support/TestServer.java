package support;

import com.sun.net.httpserver.HttpServer;
import handlers.*;
import repository.*;
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

        var restaurantRepo = new RestaurantRepository();
        var cartRepo = new CartRepository();
        var userRepo = new CampusUserRepository();
        var orderRepo = new OrderRepository();
        var orderService = new OrderService();

        server.createContext("/restaurants", new RestaurantHandler(restaurantRepo));
        server.createContext("/cart", new CartHandler(cartRepo, restaurantRepo));
        server.createContext("/users", new CampusUserHandler(userRepo));
        server.createContext("/orders", new OrderHandler(cartRepo, orderRepo, orderService));

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

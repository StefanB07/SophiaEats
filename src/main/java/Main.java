import com.sun.net.httpserver.HttpServer;

import handlers.*;
import repository.*;
import service.OrderService;

import java.net.InetSocketAddress;

public class Main {

    public static void main(String[] args) throws Exception {

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
    }
}
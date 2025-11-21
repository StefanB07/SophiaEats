package server;

import com.sun.net.httpserver.HttpServer;
import handlers.GatewayHandler;

import java.io.IOException;
import java.net.InetSocketAddress;

public class ApiGatewayMain {

    public static void main(String[] args) throws IOException {
        // this starts the other services in the same JVM for simplicity
        // and also so it's easier to turn into an app/singular app than starting 3 things separately everytime.
        startService("CatalogService", () -> {
            try { CatalogServiceMain.main(new String[0]); }
            catch (Exception e) { System.err.println("CatalogService failed: " + e.getMessage()); e.printStackTrace(); }
        });

        startService("OrderService", () -> {
            try { OrderServiceMain.main(new String[0]); }
            catch (Exception e) { System.err.println("OrderService failed: " + e.getMessage()); e.printStackTrace(); }
        });

        // Start API Gateway (port 8080)
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", new GatewayHandler()); // forwards /restaurants/**, /cart/**, /orders/**
        server.setExecutor(null);
        System.out.println("Gateway listening on http://localhost:" + port);
        server.start();
    }

    private static void startService(String name, Runnable run) {
        Thread t = new Thread(run, name);
        t.setDaemon(true); // don't block JVM shutdown
        t.start();
    }
}
package server;

import com.sun.net.httpserver.HttpServer;
import handlers.GatewayHandler;

import java.io.IOException;
import java.net.InetSocketAddress;

public class ApiGatewayMain {

    public static void main(String[] args) throws IOException {
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
        server.createContext("/", new GatewayHandler());
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

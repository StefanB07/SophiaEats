import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import handlers.RestaurantHandler;

public class Main {
    public static void main(String[] args) throws IOException {
        System.out.println("--- Starting SophiaTech Eats REST Server ---");

        // Create the HTTP server on port 8080
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Define contexts and assign handlers
        server.createContext("/restaurants", new RestaurantHandler());

        // Start the server
        server.setExecutor(null); // Use the default executor
        server.start();

        System.out.println("Server is running on http://localhost:8080/");
    }
}

package handlers;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import domain.Restaurant;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class RestaurantHandler implements HttpHandler {
    private final List<Restaurant> restaurants;

    public RestaurantHandler() {
        // Initialize some sample restaurants
        this.restaurants = new ArrayList<>();
        restaurants.add(new Restaurant("La Fabrica", "Italian", "$$"));
        restaurants.add(new Restaurant("Sushi World", "Japanese", "$$$"));
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if ("GET".equals(exchange.getRequestMethod())) {
            // Convert the list of restaurants to a simple JSON-like string
            StringBuilder response = new StringBuilder("[");
            for (int i = 0; i < restaurants.size(); i++) {
                Restaurant restaurant = restaurants.get(i);
                response.append("{")
                        .append("\"name\":\"").append(restaurant.getName()).append("\",")
                        .append("\"cuisineType\":\"").append(restaurant.getCuisineType()).append("\",")
                        .append("\"priceRange\":\"").append(restaurant.getPriceRange()).append("\"")
                        .append("}");
                if (i < restaurants.size() - 1) {
                    response.append(",");
                }
            }
            response.append("]");

            // Send the response
            exchange.sendResponseHeaders(200, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.toString().getBytes());
            os.close();
        } else {
            // Method not allowed
            exchange.sendResponseHeaders(405, -1);
        }
    }
}

package handlers;

import com.sun.net.httpserver.HttpExchange;
import domain.Dish;
import domain.DishCategory;
import domain.Restaurant;
import repository.RestaurantRepository;

import java.io.IOException;
import java.net.URI;
import java.util.stream.Collectors;

public class RestaurantHandler extends BaseHandler {
    private final RestaurantRepository repo;

    public RestaurantHandler(RestaurantRepository repo) {
        this.repo = repo;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        String path = ex.getRequestURI().getPath(); // /restaurants, /restaurants/Mensa, /restaurants/Mensa/dishes

        try {
            // GET methods
            if (method.equals("GET")) {
                // Print all the existing restaurants
                if (path.matches("^/restaurants/?$")) {
                    listAll(ex);
                    return;
                }

                // Print the searched restaurant
                if (path.startsWith("/restaurants/")) {
                    getOne(ex, path.substring("/restaurants/".length()));
                    return;
                }

                // Send a error message to the server
                sendText(ex, 404, "Not found");
                return;
            }

            // POST methods
            if (method.equals("POST")) {
                // Create a new restaurant
                if (path.matches("^/restaurants/?$")) {
                    createRestaurant(ex);
                    return;
                }

                // Add a new dish
                if (path.endsWith("/dishes")) {
                    addDish(ex, path.substring("/restaurants/".length(), path.length()-"/dishes".length()));
                    return;
                }

                // Send a error message to the server
                sendText(ex, 404, "Not found");
                return;
            }
            sendText(ex, 405, "Method Not Allowed");

        } catch (Exception e) {
            // Catch the error message
            sendText(ex, 500, "Server error: " + e.getMessage());
        }
    }

    private void listAll(HttpExchange ex) throws IOException {
        String json = "[" + repo.findAll().stream().map(this::toJson).collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    // Method used for printing the searched restaurant
    private void getOne(HttpExchange ex, String name) throws IOException {
        var r = repo.findByName(name.replace("%20"," "));
        if (r.isEmpty()) {
            sendText(ex, 404, "Restaurant not found");
            return;
        }
        sendJson(ex, 200, toJson(r.get()));
    }

    // Method used for creating a new restaurant with this params: name|cuisine|priceRange
    private void createRestaurant(HttpExchange ex) throws IOException {
        var parts = body(ex).trim().split("\\|");
        if (parts.length < 3) {
            sendText(ex, 400, "Expected: name|cuisine|priceRange");
            return;
        }
        var r = new Restaurant(parts[0].trim(), parts[1].trim(), parts[2].trim());
        repo.save(r);
        sendJson(ex, 201, toJson(r));
    }

    // Method used for adding a dish with this params: dishName|desc|price|category|type
    private void addDish(HttpExchange ex, String restNameEncoded) throws IOException {
        var rest = repo.findByName(restNameEncoded.replace("%20"," "));
        if (rest.isEmpty()) {
            sendText(ex, 404, "Restaurant not found");
            return;
        }
        var p = body(ex).trim().split("\\|");
        if (p.length < 5) {
            sendText(ex, 400, "Expected: name|desc|price|category|type");
            return;
        }
        double price;
        try {
            price = Double.parseDouble(p[2].trim());
        } catch (NumberFormatException e) {
            sendText(ex, 400, "Invalid price");
            return;
        }
        DishCategory cat;
        try {
            cat = DishCategory.valueOf(p[3].trim());
        } catch (IllegalArgumentException e) {
            sendText(ex, 400, "Invalid category");
            return;
        }

        var dish = new Dish(p[0].trim(), p[1].trim(), price, cat, p[4].trim());
        rest.get().addDishToMenu(dish);
        sendJson(ex, 201, "{\"name\":\""+esc(dish.getName())+"\",\"price\":"+price+"}");
    }

    private String toJson(Restaurant r) {
        var menu = r.getMenu().stream()
                .map(d -> "{\"name\":\""+esc(d.getName())+"\",\"price\":"+d.getPrice()+"}")
                .collect(Collectors.joining(","));
        return "{\"name\":\""+esc(r.getName())+"\",\"cuisineType\":\""+esc(r.getCuisineType())+"\",\"priceRange\":\""+esc(r.getPriceRange())+"\",\"menu\":["+menu+"]}";
    }
}

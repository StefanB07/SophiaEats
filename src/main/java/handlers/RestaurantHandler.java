package handlers;

import com.sun.net.httpserver.HttpExchange;
import domain.Dish;
import domain.DishCategory;
import domain.FilterCriteria;
import domain.Restaurant;
import repository.RestaurantRepository;

import java.io.IOException;
import java.net.URI;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;

public class RestaurantHandler extends BaseHandler {

    private final RestaurantRepository repo;

    public RestaurantHandler(RestaurantRepository repo) {
        this.repo = repo;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        String path = ex.getRequestURI().getPath(); // /restaurants, /restaurants/Mensa, /restaurants/filter etc.

        try {
            if (method.equals("GET")) {
                // 1️⃣ list all
                if (path.matches("^/restaurants/?$")) {
                    listAll(ex);
                    return;
                }

                // 2️⃣ get one by name
                if (path.startsWith("/restaurants/") && !path.endsWith("/filter")) {
                    getOne(ex, path.substring("/restaurants/".length()));
                    return;
                }

                // 3️⃣ filter restaurants
                if (path.matches("^/restaurants/filter/?$")) {
                    filterRestaurants(ex);
                    return;
                }

                sendText(ex, 404, "Not found");
                return;
            }

            if (method.equals("POST")) {
                // create a restaurant
                if (path.matches("^/restaurants/?$")) {
                    createRestaurant(ex);
                    return;
                }

                // add a dish to a restaurant
                if (path.endsWith("/dishes")) {
                    addDish(ex, path.substring("/restaurants/".length(), path.length() - "/dishes".length()));
                    return;
                }

                sendText(ex, 404, "Not found");
                return;
            }

            sendText(ex, 405, "Method Not Allowed");

        } catch (Exception e) {
            sendText(ex, 500, "Server error: " + e.getMessage());
        }
    }

    // ------------------------- EXISTING METHODS -------------------------

    private void listAll(HttpExchange ex) throws IOException {
        String json = "[" + repo.findAll().stream().map(this::toJson).collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private void getOne(HttpExchange ex, String name) throws IOException {
        var r = repo.findByName(name.replace("%20", " "));
        if (r.isEmpty()) {
            sendText(ex, 404, "Restaurant not found");
            return;
        }
        sendJson(ex, 200, toJson(r.get()));
    }

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

    private void addDish(HttpExchange ex, String restNameEncoded) throws IOException {
        var rest = repo.findByName(restNameEncoded.replace("%20", " "));
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
        sendJson(ex, 201, "{\"name\":\"" + esc(dish.getName()) + "\",\"price\":" + price + "}");
    }

    private String toJson(Restaurant r) {
        var menu = r.getMenu().stream()
                .map(d -> "{\"name\":\"" + esc(d.getName()) + "\",\"price\":" + d.getPrice() + "}")
                .collect(Collectors.joining(","));
        return "{\"name\":\"" + esc(r.getName()) + "\",\"cuisineType\":\"" + esc(r.getCuisineType())
                + "\",\"priceRange\":\"" + esc(r.getPriceRange()) + "\",\"menu\":[" + menu + "]}";
    }

    // ------------------------- NEW METHOD (FILTER) -------------------------

    private void filterRestaurants(HttpExchange ex) throws IOException {
        // Parse query params from URL
        URI uri = ex.getRequestURI();
        Map<String, String> params = queryToMap(uri.getQuery());

        FilterCriteria criteria = new FilterCriteria();
        if (params.containsKey("cuisine")) criteria.setCuisineType(params.get("cuisine"));
        if (params.containsKey("dietary")) criteria.setDietaryTag(params.get("dietary"));
        if (params.containsKey("price")) criteria.setPriceRange(params.get("price"));
        if (params.containsKey("type")) criteria.setEstablishmentType(params.get("type"));
        if (params.containsKey("available")) criteria.setOnlyAvailable(Boolean.parseBoolean(params.get("available")));

        List<Restaurant> filtered = repo.findAll().stream()
                .filter(r -> !criteria.isOnlyAvailable() || (r.isOpen()))
                .filter(r -> criteria.getCuisineType().isEmpty() ||
                        r.getCuisineType().equalsIgnoreCase(criteria.getCuisineType().get()))
                .filter(r -> criteria.getDietaryTag().isEmpty() ||
                        r.offersDietaryTag(criteria.getDietaryTag().get()))
                .filter(r -> criteria.getPriceRange().isEmpty() ||
                        r.getPriceRange().equalsIgnoreCase(criteria.getPriceRange().get()))
                .filter(r -> criteria.getEstablishmentType().isEmpty() ||
                        r.getType().equalsIgnoreCase(criteria.getEstablishmentType().get()))
                .collect(Collectors.toList());

        String json = "[" + filtered.stream().map(this::toJson).collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private Map<String, String> queryToMap(String query) {
        return query == null ? Map.of() :
                java.util.Arrays.stream(query.split("&"))
                        .map(s -> s.split("=", 2))
                        .filter(a -> a.length == 2)
                        .collect(Collectors.toMap(a -> a[0], a -> a[1]));
    }
}

package handlers;

import com.sun.net.httpserver.HttpExchange;
import domain.catalog.DeliverySlot;
import domain.catalog.FilterCriteria;
import service.CatalogService;
import domain.catalog.Dish;
import domain.catalog.DishCategory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;

public class CatalogApiHandler extends BaseHandler {
    private final CatalogService catalog;
    private record DishPayload(
            String name,
            String description,
            double price,
            String category,
            String type,
            String dietaryInfo
    ) {}

    private record SlotPayload(String label, int capacity) {}

    private static final Pattern P_SLOT =
            Pattern.compile("\\{[^}]*\"label\"\\s*:\\s*\"([^\"]+)\"[^}]*\"capacity\"\\s*:\\s*(\\d+)[^}]*\\}");

    // payload pentru POST /restaurants/{name}/slots
    private record AddSlotPayload(String start, int capacity) {}

    private static final Pattern P_START = Pattern.compile("\"start\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern P_CAP   = Pattern.compile("\"capacity\"\\s*:\\s*(\\d+)");

    private AddSlotPayload parseAddSlotPayload(String json) {
        if (json == null) return null;
        Matcher m1 = P_START.matcher(json);
        Matcher m2 = P_CAP.matcher(json);
        if (!m1.find() || !m2.find()) return null;
        String start = m1.group(1).trim();
        int cap = Integer.parseInt(m2.group(1));
        return new AddSlotPayload(start, cap);
    }

    private static LocalDateTime parseTime(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDateTime.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        } catch (DateTimeParseException ignore) {
            try { return LocalDateTime.parse(s); }
            catch (DateTimeParseException e) { return null; }
        }
    }


    private static final Pattern P_NAME  = Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern P_DESC  = Pattern.compile("\"description\"\\s*:\\s*\"([^\"]*)\"");
    private static final Pattern P_PRICE = Pattern.compile("\"price\"\\s*:\\s*(\\d+(?:\\.\\d+)?)");
    private static final Pattern P_CAT   = Pattern.compile("\"category\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern P_TYPE  = Pattern.compile("\"type\"\\s*:\\s*\"([^\"]*)\"");
    private static final Pattern P_INFO  = Pattern.compile("\"dietaryInfo\"\\s*:\\s*\"([^\"]*)\"");

    private DishPayload parseDishPayload(String json) {
        if (json == null) return null;
        Matcher mName = P_NAME.matcher(json);
        Matcher mPrice = P_PRICE.matcher(json);
        Matcher mCat = P_CAT.matcher(json);

        if (!mName.find() || !mPrice.find() || !mCat.find()) {
            return null; // Missing required fields
        }

        String name = mName.group(1).trim();
        double price = Double.parseDouble(mPrice.group(1));
        String cat = mCat.group(1).trim();

        String desc = "";
        Matcher mDesc = P_DESC.matcher(json);
        if (mDesc.find()) desc = mDesc.group(1).trim();

        String type = "";
        Matcher mType = P_TYPE.matcher(json);
        if (mType.find()) type = mType.group(1).trim();

        String info = "";
        Matcher mInfo = P_INFO.matcher(json);
        if (mInfo.find()) info = mInfo.group(1).trim();

        return new DishPayload(name, desc, price, cat, type, info);
    }

    public CatalogApiHandler(CatalogService catalog) {
        this.catalog = catalog;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        String rawPath = ex.getRequestURI().getPath();

        try {
            // Dish management
            if (rawPath.startsWith("/restaurants/") && rawPath.endsWith("/dishes") && "POST".equalsIgnoreCase(method)) {
                addDish(ex, rawPath); return; }
            if (rawPath.startsWith("/restaurants/") && rawPath.contains("/dishes/") && "PUT".equalsIgnoreCase(method)) {
                updateDish(ex, rawPath); return; }
            if (rawPath.startsWith("/restaurants/") && rawPath.contains("/dishes/") && "DELETE".equalsIgnoreCase(method)) {
                deleteDish(ex, rawPath); return; }

            // Slot management for managers
            if (rawPath.startsWith("/restaurants/") && rawPath.endsWith("/slots") && "POST".equalsIgnoreCase(method)) {
                addSlot(ex, rawPath); return; }
            if (rawPath.startsWith("/restaurants/") && rawPath.endsWith("/slots") && "PUT".equalsIgnoreCase(method)) {
                updateSlots(ex, rawPath); return; }
            if (rawPath.startsWith("/restaurants/") && rawPath.endsWith("/slots") && "DELETE".equalsIgnoreCase(method)) {
                deleteSlot(ex, rawPath); return; }

            if (!"GET".equalsIgnoreCase(method)) {
                sendError(ex, 405, "Method Not Allowed");
                return;
            }

            // Read-only catalog endpoints
            if (rawPath.matches("^/restaurants/?$")) { listAll(ex); return; }
            if (rawPath.matches("^/restaurants/filter/?$")) { filter(ex); return; }
            if (rawPath.startsWith("/restaurants/")) { one(ex, rawPath.substring("/restaurants/".length())); return; }
            if (rawPath.matches("^/delivery/locations/?$")) { getLocations(ex); return; }
            if (rawPath.matches("^/delivery/slots/?$")) { getSlots(ex); return; }

            sendError(ex, 404, "Not found");
        } catch (Exception e) {
            sendError(ex, 500, "Server error: " + e.getMessage());
        }
    }

    // New helper record to return both parsed payload and resolved category
    private record ParsedDish(DishPayload payload, DishCategory category) {}

    // New method to parse slots payload from JSON
    private java.util.List<SlotPayload> parseSlotsPayload(String json) {
        if (json == null || json.isBlank()) return java.util.List.of();
        java.util.List<SlotPayload> result = new java.util.ArrayList<>();
        Matcher m = P_SLOT.matcher(json);
        while (m.find()) {
            String label = m.group(1).trim();
            int cap = Integer.parseInt(m.group(2));
            result.add(new SlotPayload(label, cap));
        }
        return result;
    }


    // Parse dish body and resolve category
    private ParsedDish parseAndValidateDish(HttpExchange ex) throws IOException {
        String ct = ex.getRequestHeaders().getFirst("Content-Type");
        if (ct == null || !ct.contains("application/json")) {
            sendError(ex, 400, "Expected Content-Type: application/json");
            return null;
        }

        String raw = body(ex).trim();
        DishPayload p = parseDishPayload(raw);
        if (p == null) {
            sendError(ex, 400,
                    "Invalid JSON payload. Expected at least fields: name, price, category");
            return null;
        }

        DishCategory cat;
        try {
            cat = DishCategory.valueOf(p.category());
        } catch (IllegalArgumentException e) {
            sendError(ex, 400, "Unknown category: " + p.category());
            return null;
        }

        return new ParsedDish(p, cat);
    }

    // POST /restaurants/{name}/dishes
    private void addDish(HttpExchange ex, String rawPath) throws IOException {
        String prefix = "/restaurants/";
        String suffix = "/dishes";

        String encodedName = rawPath.substring(prefix.length(), rawPath.length() - suffix.length());
        String restaurantName = urlDecode(encodedName);

        if (restaurantName == null || restaurantName.isBlank()) {
            sendError(ex, 400, "Restaurant name is required in URL");
            return;
        }

        ParsedDish parsed = parseAndValidateDish(ex);
        if (parsed == null) return; // parseAndValidateDish already sent an error

        DishPayload p = parsed.payload();
        DishCategory cat = parsed.category();

        Dish dish;
        try {
            dish = catalog.addDishToRestaurant(
                    restaurantName,
                    p.name(),
                    p.description(),
                    p.price(),
                    cat,
                    p.type(),
                    p.dietaryInfo()
            );
        } catch (IllegalArgumentException e) {
            sendError(ex, 404, e.getMessage());
            return;
        }

        // JSON response with created dish info
        String json = "{"
                + "\"name\":" + qs(dish.getName()) + ","
                + "\"description\":" + qs(dish.getDescription()) + ","
                + "\"price\":" + dish.getPrice()
                + "}";

        sendJson(ex, 201, json);
    }

    // PUT /restaurants/{restaurant}/dishes/{dish}
    private void updateDish(HttpExchange ex, String rawPath) throws IOException {
        // The path can be something like this /restaurants/Restaurant%20A/dishes/Pizza%20Margherita
        String prefix = "/restaurants/";
        String middle = "/dishes/";

        int idxMiddle = rawPath.indexOf(middle);
        if (idxMiddle < 0) {
            sendError(ex, 400, "Invalid path for dish update");
            return;
        }

        String encodedRestaurant = rawPath.substring(prefix.length(), idxMiddle);
        String encodedDishName  = rawPath.substring(idxMiddle + middle.length());

        String restaurantName = urlDecode(encodedRestaurant);
        String existingDishName = urlDecode(encodedDishName);

        if (restaurantName == null || restaurantName.isBlank()
                || existingDishName == null || existingDishName.isBlank()) {
            sendError(ex, 400, "Restaurant and dish name are required in URL");
            return;
        }

        ParsedDish parsed = parseAndValidateDish(ex);
        if (parsed == null) return; // error already sent

        DishPayload p = parsed.payload();
        DishCategory cat = parsed.category();

        try {
            Dish updated = catalog.updateDishForRestaurant(
                    restaurantName,
                    existingDishName,
                    p.name(),
                    p.description(),
                    p.price(),
                    cat,
                    (p.dietaryInfo() != null && !p.dietaryInfo().isBlank())
                            ? p.dietaryInfo()
                            : p.type()
            );

            String json = "{"
                    + "\"name\":" + qs(updated.getName()) + ","
                    + "\"price\":" + updated.getPrice()
                    + "}";

            sendJson(ex, 200, json);
        } catch (IllegalArgumentException e) {
            //  restaurant not found or dish not found
            sendError(ex, 404, e.getMessage());
        }
    }

    // DELETE /restaurants/{restaurant}/dishes/{dish}
    private void deleteDish(HttpExchange ex, String rawPath) throws IOException {
        String prefix = "/restaurants/";
        String middle = "/dishes/";

        int idxMiddle = rawPath.indexOf(middle);
        if (idxMiddle < 0) {
            sendError(ex, 400, "Invalid path for dish delete");
            return;
        }

        String encodedRestaurant = rawPath.substring(prefix.length(), idxMiddle);
        String encodedDishName  = rawPath.substring(idxMiddle + middle.length());

        String restaurantName = urlDecode(encodedRestaurant);
        String dishName = urlDecode(encodedDishName);

        if (restaurantName == null || restaurantName.isBlank()
                || dishName == null || dishName.isBlank()) {
            sendError(ex, 400, "Restaurant and dish name are required in URL");
            return;
        }

        try {
            catalog.deleteDishForRestaurant(restaurantName, dishName);
            // 204 No Content ar fi ok, dar dÄƒm 200 cu un mic JSON pt debugging
            sendJson(ex, 200, "{\"deleted\":true}");
        } catch (IllegalArgumentException e) {
            sendError(ex, 404, e.getMessage());
        }
    }

    // PUT /restaurants/{name}/slots
    // Body JSON: {"slots":[{"label":"11:00-11:30","capacity":5}, ...]}
    private void updateSlots(HttpExchange ex, String rawPath) throws IOException {
        String prefix = "/restaurants/";
        String suffix = "/slots";

        String encodedName = rawPath.substring(prefix.length(), rawPath.length() - suffix.length());
        String restaurantName = urlDecode(encodedName);

        if (restaurantName == null || restaurantName.isBlank()) {
            sendError(ex, 400, "Restaurant name is required in URL");
            return;
        }

        String ct = ex.getRequestHeaders().getFirst("Content-Type");
        if (ct == null || !ct.contains("application/json")) {
            sendError(ex, 400, "Expected Content-Type: application/json");
            return;
        }

        String raw = body(ex).trim();
        var slots = parseSlotsPayload(raw);
        if (slots.isEmpty()) {
            sendError(ex, 400, "Invalid payload. Expected at least one slot with label & capacity.");
            return;
        }

        try {
            catalog.updateSlotsForRestaurant(
                    restaurantName,
                    slots.stream()
                            .map(s -> new service.CatalogService.SlotUpdate(s.label(), s.capacity()))
                            .collect(java.util.stream.Collectors.toList())
            );
            sendJson(ex, 200, "{\"updated\":true}");
        } catch (IllegalArgumentException e) {
            sendError(ex, 404, e.getMessage());
        } catch (Exception e) {
            sendError(ex, 500, "Failed to update slots: " + e.getMessage());
        }
    }

    // POST /restaurants/{name}/slots
    // Body JSON: {"start":"yyyy-MM-dd HH:mm","capacity":N}
    private void addSlot(HttpExchange ex, String path) throws IOException {
        String prefix = "/restaurants/";
        String suffix = "/slots";

        String encodedName = path.substring(prefix.length(), path.length() - suffix.length());
        String restaurantName = urlDecode(encodedName);

        if (restaurantName == null || restaurantName.isBlank()) {
            sendError(ex, 400, "Restaurant name is required in URL");
            return;
        }

        String ct = ex.getRequestHeaders().getFirst("Content-Type");
        if (ct == null || !ct.contains("application/json")) {
            sendError(ex, 400, "Expected Content-Type: application/json");
            return;
        }

        String raw = body(ex).trim();
        AddSlotPayload p = parseAddSlotPayload(raw);
        if (p == null) {
            sendError(ex, 400,
                    "Invalid JSON payload. Expected {\"start\":\"yyyy-MM-dd HH:mm\",\"capacity\":N}");
            return;
        }

        LocalDateTime start = parseTime(p.start());
        if (start == null) {
            sendError(ex, 400, "Invalid datetime format for 'start'");
            return;
        }
        if (p.capacity() <= 0) {
            sendError(ex, 400, "capacity must be > 0");
            return;
        }

        try {
            DeliverySlot slot = catalog.addSlotForRestaurant(restaurantName, start, p.capacity());
            String json = "{"
                    + "\"label\":" + qs(slot.getLabel()) + ","
                    + "\"capacity\":" + slot.getCapacity()
                    + "}";
            sendJson(ex, 201, json);
        } catch (IllegalArgumentException e) {
            sendError(ex, 404, e.getMessage());
        }
    }


    private void deleteSlot(HttpExchange ex, String path) throws IOException {
        String prefix = "/restaurants/";
        String suffix = "/slots";

        String encodedName = path.substring(prefix.length(), path.length() - suffix.length());
        String restaurantName = urlDecode(encodedName);

        if (restaurantName == null || restaurantName.isBlank()) {
            sendError(ex, 400, "Restaurant name is required in URL");
            return;
        }

        // luÄƒm label-ul din query: /restaurants/{name}/slots?label=...
        URI uri = ex.getRequestURI();
        Map<String, String> params = queryToMap(uri.getRawQuery());

        String label = urlDecode(params.get("label"));
        if (label == null || label.isBlank()) {
            sendError(ex, 400, "Missing 'label' query parameter");
            return;
        }

        try {
            catalog.deleteSlotForRestaurant(restaurantName, label);
            sendJson(ex, 200, "{\"deleted\":true}");
        } catch (IllegalArgumentException e) {
            sendError(ex, 404, e.getMessage());
        }
    }

    private void listAll(HttpExchange ex) throws IOException {
        var json = "[" + catalog.listAll().stream()
                .map(this::restaurantSummaryJson)
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private void one(HttpExchange ex, String nameEncoded) throws IOException {
        var name = urlDecode(nameEncoded);
        var opt = catalog.findByName(name);
        if (opt.isEmpty()) {
            sendError(ex, 404, "Restaurant not found");
            return;
        }

        var r = opt.get();
        var json = restaurantFullJson(r);

        sendJson(ex, 200, json);
    }

    private void filter(HttpExchange ex) throws IOException {
        // Take the raw URL query and decode it
        URI uri = ex.getRequestURI();
        Map<String, String> params = queryToMap(uri.getRawQuery());

        FilterCriteria c = new FilterCriteria();
        if (params.containsKey("cuisine"))   c.setCuisineType(urlDecode(params.get("cuisine")));
        if (params.containsKey("dietary"))   c.setDietaryTag(urlDecode(params.get("dietary")));
        if (params.containsKey("price"))     c.setPriceRange(urlDecode(params.get("price")));
        if (params.containsKey("type"))      c.setEstablishmentType(urlDecode(params.get("type")));
        if (params.containsKey("available")) c.setOnlyAvailable(Boolean.parseBoolean(urlDecode(params.get("available"))));

        var list = catalog.filter(c);
        var json = "[" + list.stream()
                .map(this::restaurantSummaryJson)
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private Map<String, String> queryToMap(String query) {
        return (query == null || query.isBlank()) ? Map.of() :
                java.util.Arrays.stream(query.split("&"))
                        .map(s -> s.split("=", 2))
                        .filter(a -> a.length == 2)
                        .collect(Collectors.toMap(a -> a[0], a -> a[1]));
    }

    // ---------- helpers ----------

    /** Decode UTF-8 the name from the URL path (accepts spaces, diacritics etc.) */
    private static String urlDecode(String s) {
        if (s == null) return null;
        return URLDecoder.decode(s, StandardCharsets.UTF_8);
    }

    /** Safe quote + escape for JSON strings.
     * Return with quotes. */
    private static String qs(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder(s.length() + 16);
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '\\': sb.append("\\\\"); break;
                case '\"': sb.append("\\\""); break;
                case '\b': sb.append("\\b");  break;
                case '\f': sb.append("\\f");  break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                default:
                    // Escape for control characters < 0x20
                    if (ch < 0x20) {
                        sb.append(String.format("\\u%04x", (int) ch));
                    } else {
                        sb.append(ch);
                    }
            }
        }
        sb.append('"');
        return sb.toString();
    }

    // New helper methods to avoid duplicated JSON building
    private String dishToJson(domain.Dish d) {
        // Build dietaryTags JSON array
        String tagsJson = "[]";
        if (d.getDietaryTags() != null && !d.getDietaryTags().isEmpty()) {
            tagsJson = "[" + d.getDietaryTags().stream()
                    .map(tag -> qs(tag.name())) // enum -> string cu ghilimele
                    .collect(Collectors.joining(",")) + "]";
        }

        return "{"
                + "\"id\":"          + qs(d.getId()) + ","                                           // id unic
                + "\"name\":"        + qs(d.getName()) + ","                                         // nume
                + "\"description\":" + qs(d.getDescription()) + ","                                  // descriere
                + "\"price\":"       + d.getPrice() + ","                                            // preÈ›
                + "\"category\":"    + (d.getCategory() != null                                      // MAIN_COURSE, STARTER etc.
                ? qs(d.getCategory().name())
                : "null") + ","
                + "\"type\":"        + qs(d.getType()) + ","                                         // ex. "Vegetarian", "Contains meat"
                + "\"dietaryTags\":" + tagsJson                                                      // array de enum-uri ca string
                + "}";
    }


    private String restaurantSummaryJson(domain.Restaurant r) {
        return "{"
                + "\"name\":"        + qs(r.getName())        + ","
                + "\"cuisineType\":" + qs(r.getCuisineType()) + ","
                + "\"priceRange\":"  + qs(r.getPriceRange())
                + "}";
    }

    private String restaurantFullJson(domain.Restaurant r) {
        var menu = r.getMenu().stream()
                .map(this::dishToJson)
                .collect(Collectors.joining(","));

        return "{"
                + "\"name\":"        + qs(r.getName())        + ","
                + "\"cuisineType\":" + qs(r.getCuisineType()) + ","
                + "\"priceRange\":"  + qs(r.getPriceRange())  + ","
                + "\"menu\":[" + menu + "]"
                + "}";
    }

    private String locationToJson(domain.DeliveryLocation l) {
        return "{"
                + "\"name\":" + qs(l.getName()) + ","
                + "\"description\":" + qs(l.getDescription())
                + "}";
    }

    private String slotToJson(domain.DeliverySlot s) {
        return "{"
                + "\"label\":" + qs(s.getLabel()) + ","
                + "\"capacity\":" + s.getRemainingCapacity()
                + "}";
    }

    private void getLocations(HttpExchange ex) throws IOException {
        var json = "[" + catalog.getAllLocations().stream()
                .map(this::locationToJson)
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private void getSlots(HttpExchange ex) throws IOException {
        URI uri = ex.getRequestURI();
        Map<String, String> params = queryToMap(uri.getRawQuery());

        String restaurantName = urlDecode(params.get("restaurant"));

        if (restaurantName == null) {
            sendError(ex, 400, "Missing 'restaurant' parameter");
            return;
        }

        var json = "[" + catalog.getSlotsForRestaurant(restaurantName).stream()
                .map(this::slotToJson)
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }
}


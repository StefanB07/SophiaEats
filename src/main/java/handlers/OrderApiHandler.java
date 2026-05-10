package handlers;


import com.sun.net.httpserver.HttpExchange;
import domain.order.CampusUser;
import domain.order.DeliveryLocation;
import domain.catalog.Dish;
import domain.order.Order;
import domain.order.Payment;
import domain.order.PaymentMethod;
import repository.interfaces.CampusUserRepository;
import service.CartService;
import service.CatalogService;
import service.OrderService;
import repository.interfaces.OrderRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class OrderApiHandler extends BaseHandler {
    private final CartService carts;
    private final OrderService ordersSvc;
    private final OrderRepository ordersRepo;
    private final CatalogService catalog;
    private final CampusUserRepository usersRepo;

    public OrderApiHandler(CartService carts, OrderService ordersSvc, OrderRepository ordersRepo, CatalogService catalog, CampusUserRepository usersRepo) {
        this.carts = carts;
        this.ordersSvc = ordersSvc;
        this.ordersRepo = ordersRepo;
        this.catalog = catalog;
        this.usersRepo = usersRepo;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        String rawPath = ex.getRequestURI().getPath();
        // Allow optional /api prefix so SPA routes (/app) don't clash with API paths
        String path = rawPath.startsWith("/api/") ? rawPath.substring(4) : rawPath;
        try {
            // Cart endpoints
            if (path.matches("^/cart/?$") && method.equals("GET")) { getCart(ex); return; }
            if (path.matches("^/cart/?$") && method.equals("POST")) { addToCart(ex); return; }
            if (path.matches("^/cart/?$") && method.equals("DELETE")) { clearCart(ex); return; }
            if (path.matches("^/cart/delivery-options/?$") && method.equals("GET")) { getDeliveryOptions(ex); return; }
            // Legacy: old endpoint for adding items
            if (path.matches("^/cart/items/?$") && method.equals("POST")) { addToCart(ex); return; }

            // Order endpoints
            if (path.matches("^/orders/?$") && method.equals("POST")) { createOrder(ex); return; }
            if (path.startsWith("/orders/") && method.equals("GET")) { getOrder(ex, path.substring("/orders/".length())); return; }

            sendError(ex, 404, "Not found");
        } catch (Exception e) {
            sendError(ex, 500, "Server error: " + e.getMessage());
        }
    }

    private void getCart(HttpExchange ex) throws IOException {
        String userId = ex.getRequestHeaders().getFirst("X-User-Id");
        if (userId == null || userId.isBlank()) {
            sendError(ex, 400, "X-User-Id header is required");
            return;
        }
        var cart = carts.getOrCreateCartByUserId(userId.trim());
        var items = cart.getItems().stream()
                .map(it -> "{\"name\":\""+esc(it.getDish().getName())+"\",\"qty\":"+it.getQuantity()+",\"lineTotal\":"+it.getTotalPrice()+"}")
                .collect(Collectors.joining(","));
        var json = "{\"userId\":\""+esc(userId)+"\",\"total\":"+cart.calculateTotal()+",\"items\":["+items+"]}";
        sendJson(ex, 200, json);
    }

    // Request body (JSON): {"restaurant":"..","dish":"..","qty":N}
    // Legacy text body:    dish|qty|restaurant
    private void addToCart(HttpExchange ex) throws IOException {
        String userId = requireUserId(ex);
        if (userId == null) return;

        String raw = body(ex).trim();
        String ct = ex.getRequestHeaders().getFirst("Content-Type");
        String restaurant;
        String dishName;
        int qty;

        if (ct != null && ct.contains("application/json")) {
            AddItemPayload p = parseAddItemPayload(raw);
            if (p == null) { sendError(ex, 400, "Invalid JSON payload. Expected {\"restaurant\":\"..\",\"dish\":\"..\",\"qty\":N}"); return; }
            if (p.qty <= 0) { sendError(ex, 400, "qty must be > 0"); return; }
            restaurant = p.restaurant; dishName = p.dish; qty = p.qty;
        } else {
            var parts = raw.split("\\|");
            if (parts.length < 3) { sendError(ex, 400, "Expected: dish|qty|restaurant (or JSON body) "); return; }
            dishName = parts[0].trim();
            try { qty = Integer.parseInt(parts[1].trim()); } catch (NumberFormatException e) { sendError(ex, 400, "Invalid qty"); return; }
            restaurant = parts[2].trim();
        }

        var restOpt = catalog.findByName(restaurant);
        if (restOpt.isEmpty()) { sendError(ex, 404, "Restaurant not found"); return; }
        Optional<Dish> dish = restOpt.get().getMenu().stream().filter(d -> d.getName().equals(dishName)).findFirst();
        if (dish.isEmpty()) { sendError(ex, 404, "Dish not found"); return; }

        var cart = carts.getOrCreateCartByUserId(userId);
        carts.addItem(cart, restOpt.get(), dish.get(), qty);
        sendJson(ex, 201, "{\"userId\":\""+esc(userId)+"\",\"added\":\""+esc(dish.get().getName())+"\",\"qty\":"+qty+"}");
    }

    // Request body (JSON): {"deliveryPlace":"..","deliveryTime":"..","paymentMethod":"STUDENT_CREDIT|EXTERNAL"}
    // Legacy text body:    deliveryPlace|deliveryTime
    private void createOrder(HttpExchange ex) throws IOException {
        String userId = requireUserId(ex);
        if (userId == null) return;

        String raw = body(ex).trim();
        String ct = ex.getRequestHeaders().getFirst("Content-Type");
        String place;
        String timeStr;
        String paymentMethodStr = "EXTERNAL"; // default if not provided

        if (ct != null && ct.contains("application/json")) {
            OrderPayload p = parseOrderPayload(raw);
            if (p == null) {
                sendError(ex, 400,
                        "Invalid JSON payload. Expected {\"deliveryPlace\":\"..\",\"deliveryTime\":\"..\",\"paymentMethod\":\"STUDENT_CREDIT|EXTERNAL\"}");
                return;
            }
            place = p.deliveryPlace;
            timeStr = p.deliveryTime;
            if (p.paymentMethod != null && !p.paymentMethod.isBlank()) {
                paymentMethodStr = p.paymentMethod;
            }
        } else {
            // legacy text/plain: deliveryPlace|deliveryTime
            var parts = raw.split("\\|");
            if (parts.length < 2) {
                sendError(ex, 400, "Expected: deliveryPlace|deliveryTime (or JSON body)");
                return;
            }
            place = parts[0].trim();
            timeStr = parts[1].trim();
        }

        LocalDateTime when = parseTime(timeStr);
        if (when == null) {
            sendError(ex, 400, "Invalid datetime format");
            return;
        }

        var cart = carts.getOrCreateCartByUserId(userId);
        if (cart.getItems().isEmpty()) {
            sendError(ex, 400, "Cart is empty for user: " + userId);
            return;
        }

        PaymentMethod pm;
        try {
            pm = PaymentMethod.valueOf(paymentMethodStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            sendError(ex, 400, "Invalid paymentMethod. Use STUDENT_CREDIT or EXTERNAL");
            return;
        }

        Order order = ordersSvc.placeOrder(cart, new DeliveryLocation(place, "null"), when);

        CampusUser campusUser = null;
        if (pm == PaymentMethod.STUDENT_CREDIT) {
            campusUser = usersRepo.findById(userId).orElse(null);
            if (campusUser == null) {
                sendError(ex, 400, "Unknown user for student credit");
                return;
            }
        }

        Payment payment;
        try {
            payment = ordersSvc.pay(order, pm, campusUser);
        } catch (IllegalArgumentException exPay) {
            if ("INSUFFICIENT_CREDIT".equals(exPay.getMessage())) {
                sendError(ex, 402, "INSUFFICIENT_CREDIT");
                return;
            }
            throw exPay;
        }

        ordersRepo.save(order);
        carts.clear(cart);

        sendJson(ex, 201, orderToJson(order, payment));
    }

    private void getOrder(HttpExchange ex, String id) throws IOException {
        var opt = ordersRepo.findById(id);
        if (opt.isEmpty()) { sendError(ex, 404, "Order not found"); return; }
        sendJson(ex, 200, orderToJson(opt.get(), opt.get().getPayment()));
    }

    private void getDeliveryOptions(HttpExchange ex) throws IOException {
        // Determine user id (fall back to "1" if header missing for now)
        String userId = ex.getRequestHeaders().getFirst("X-User-Id");
        if (userId == null || userId.isBlank()) {
            userId = "1"; // fallback default
        }

        var cart = carts.getOrCreateCartByUserId(userId);

        String restaurantName = null;
        if (!cart.getItems().isEmpty()) {
            restaurantName = cart.getItems().get(0).getRestaurantName();
        }

        var locations = catalog.getAllLocations();
        java.util.List<domain.catalog.DeliverySlot> slots = restaurantName != null ? catalog.getSlotsForRestaurant(restaurantName) : java.util.Collections.emptyList();

        String locationsJson = locations.stream()
                .map(l -> "{\"name\":\"" + esc(l.getName()) + "\"}")
                .collect(Collectors.joining(","));

        String slotsJson = slots.stream()
                .map(s -> "{\"label\":\"" + esc(s.getLabel()) + "\",\"capacity\":" + s.getRemainingCapacity() + "}")
                .collect(Collectors.joining(","));

        String json = String.format("{\"locations\":[%s], \"slots\":[%s]}", locationsJson, slotsJson);
        sendJson(ex, 200, json);
    }

    private String orderToJson(Order o, Payment payment) {
        String items = o.getItems().stream()
                .map(it -> {
                    // Collect extras into a JSON array of strings or objects, depending on what the frontend expects.
                    // Assuming frontend might just expect a list of extra names
                    StringBuilder extrasJson = new StringBuilder("[");
                    try {
                        java.lang.reflect.Field extrasField = domain.order.OrderItem.class.getDeclaredField("extraOptions");
                        extrasField.setAccessible(true);
                        java.util.List<domain.catalog.ExtraOption> extras = (java.util.List<domain.catalog.ExtraOption>) extrasField.get(it);
                        if (extras != null) {
                            extrasJson.append(extras.stream()
                                    .map(e -> "\"" + esc(e.getName()) + "\"")
                                    .collect(Collectors.joining(",")));
                        }
                    } catch (Exception ignored) {}
                    extrasJson.append("]");

                    return "{\"name\":\"" + esc(it.getDish().getName()) + "\",\"qty\":" + it.getQuantity() + ",\"lineTotal\":" + it.getTotalPrice() + ",\"extras\":" + extrasJson.toString() + "}";
                })
                .collect(Collectors.joining(","));

        String paymentJson = payment == null ? "null" :
                "{\"method\":\"" + payment.getMethod() + "\"," +
                        "\"amount\":" + payment.getAmount() + "," +
                        "\"success\":" + payment.isSuccess() + "}";

        return "{" +
                "\"id\":\""+esc(o.getId())+"\"," +
                "\"status\":\""+o.getStatus()+"\"," +
                "\"createdAt\":\""+o.getCreatedAt()+"\"," +
                "\"deliveryPlace\":\""+esc(o.getDeliveryPlace().getName())+"\"," +
                "\"deliveryTime\":\""+o.getDeliveryTime()+"\"," +
                "\"total\":"+o.getTotal()+"," +
                "\"payment\":" + paymentJson + "," +
                "\"items\":["+items+"]" +
                "}";
    }

    private static LocalDateTime parseTime(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDateTime.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        } catch (DateTimeParseException ignore) {
            try { return LocalDateTime.parse(s); } catch (DateTimeParseException e) { return null; }
        }
    }

    private String requireUserId(HttpExchange ex) throws IOException {
        String id = ex.getRequestHeaders().getFirst("X-User-Id");
        if (id == null || id.isBlank()) { sendError(ex, 400, "X-User-Id header is required"); return null; }
        return id.trim();
    }

    // Minimal JSON extraction
    private record AddItemPayload(String restaurant, String dish, int qty) {}
    private static final Pattern P_REST = Pattern.compile("\"restaurant\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern P_DISH = Pattern.compile("\"dish\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern P_QTY  = Pattern.compile("\"qty\"\\s*:\\s*(\\d+)");

    private AddItemPayload parseAddItemPayload(String json) {
        if (json == null) return null;
        Matcher m1 = P_REST.matcher(json);
        Matcher m2 = P_DISH.matcher(json);
        Matcher m3 = P_QTY.matcher(json);
        if (!m1.find() || !m2.find() || !m3.find()) return null;
        String rest = m1.group(1).trim();
        String dish = m2.group(1).trim();
        int qty = Integer.parseInt(m3.group(1));
        return new AddItemPayload(rest, dish, qty);
    }

    // JSON payload for createOrder
    private record OrderPayload(String deliveryPlace, String deliveryTime, String paymentMethod) {}

    private static final Pattern P_PLACE = Pattern.compile("\"deliveryPlace\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern P_TIME  = Pattern.compile("\"deliveryTime\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern P_PAY   = Pattern.compile("\"paymentMethod\"\\s*:\\s*\"([^\"]+)\"");

    private OrderPayload parseOrderPayload(String json) {
        if (json == null) return null;
        Matcher m1 = P_PLACE.matcher(json);
        Matcher m2 = P_TIME.matcher(json);
        Matcher m3 = P_PAY.matcher(json);
        if (!m1.find() || !m2.find()) return null;
        String place = m1.group(1).trim();
        String time = m2.group(1).trim();
        String method = m3.find() ? m3.group(1).trim() : "EXTERNAL";
        return new OrderPayload(place, time, method);
    }

    // DELETE /cart -> clear current user's cart
    private void clearCart(HttpExchange ex) throws IOException {
        String userId = requireUserId(ex);
        if (userId == null) return;
        var cart = carts.getOrCreateCartByUserId(userId);
        carts.clear(cart);
        // 204 No Content is typical for delete; include a small JSON for convenience
        sendJson(ex, 200, "{\"cleared\":true,\"userId\":\"" + esc(userId) + "\"}");
    }
}


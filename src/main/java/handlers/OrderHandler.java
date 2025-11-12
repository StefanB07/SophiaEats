//@Deprecated

//package handlers;
//
//import com.sun.net.httpserver.HttpExchange;
//import domain.DeliveryLocation;
//import domain.Order;
//import repository.CartRepository;
//import repository.OrderRepository;
//import service.OrderService;
//
//import java.io.IOException;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//import java.time.format.DateTimeParseException;
//import java.util.stream.Collectors;
//
//public class OrderHandler extends BaseHandler {
//
//    private final CartRepository cartRepo;
//    private final OrderRepository orderRepo;
//    private final OrderService orderService;
//
//    public OrderHandler(CartRepository cartRepo, OrderRepository orderRepo, OrderService orderService) {
//        this.cartRepo = cartRepo;
//        this.orderRepo = orderRepo;
//        this.orderService = orderService;
//    }
//
//    @Override
//    public void handle(HttpExchange ex) throws IOException {
//        String method = ex.getRequestMethod();
//        String path = ex.getRequestURI().getPath(); // /orders, /orders/{id}
//
//        try {
//            if ("POST".equals(method) && path.matches("^/orders/?$")) {
//                // body: deliveryPlace|deliveryTime  (time format: "yyyy-MM-dd HH:mm" sau ISO "yyyy-MM-dd'T'HH:mm")
//                createOrder(ex);
//                return;
//            }
//            if ("GET".equals(method) && path.startsWith("/orders/")) {
//                String id = path.substring("/orders/".length());
//                getOrder(ex, id);
//                return;
//            }
//            sendText(ex, 404, "Not found");
//        } catch (Exception e) {
//            sendText(ex, 500, "Server error: " + e.getMessage());
//        }
//    }
//
//    private void createOrder(HttpExchange ex) throws IOException {
//        var parts = body(ex).trim().split("\\|");
//        if (parts.length < 2) { sendText(ex, 400, "Expected: deliveryPlace|deliveryTime"); return; }
//
//        String place = parts[0].trim();
//        LocalDateTime when = parseTime(parts[1].trim());
//        if (when == null) { sendText(ex, 400, "Invalid datetime. Use 'yyyy-MM-dd HH:mm' or ISO 'yyyy-MM-ddTHH:mm'"); return; }
//
//        var cart = cartRepo.createCart();
//
//        Order order;
//        try {
//            order = orderService.placeOrder(cart, new DeliveryLocation(place, "null"), when);
//        } catch (IllegalArgumentException iae) {
//            sendText(ex, 400, iae.getMessage());
//            return;
//        }
//
//        orderRepo.save(order);
//        // (opțional) goliți coșul după creare – dacă aveți metodă. Altfel rămâne cum e.
//
//        sendJson(ex, 201, toJson(order));
//    }
//
//    private void getOrder(HttpExchange ex, String id) throws IOException {
//        var opt = orderRepo.findById(id);
//        if (opt.isEmpty()) { sendText(ex, 404, "Order not found: " + id); return; }
//        sendJson(ex, 200, toJson(opt.get()));
//    }
//
//    private String toJson(Order o) {
//        String items = o.getItems().stream()
//                .map(it -> "{\"name\":\""+esc(it.getDish().getName())+"\",\"qty\":"+it.getQuantity()+",\"lineTotal\":"+it.getTotalPrice()+"}")
//                .collect(Collectors.joining(","));
//        return "{"
//                + "\"id\":\""+esc(o.getId())+"\","
//                + "\"status\":\""+o.getStatus()+"\","
//                + "\"createdAt\":\""+o.getCreatedAt()+"\","
//                + "\"deliveryPlace\":\""+esc(o.getDeliveryPlace().getName())+"\","
//                + "\"deliveryTime\":\""+o.getDeliveryTime()+"\","
//                + "\"total\":"+o.getTotal()+","
//                + "\"items\":["+items+"]"
//                + "}";
//    }
//
//    private static LocalDateTime parseTime(String s) {
//        try {
//            return LocalDateTime.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
//        } catch (DateTimeParseException ignore) {
//            try { return LocalDateTime.parse(s); } catch (DateTimeParseException e) { return null; }
//        }
//    }
//}

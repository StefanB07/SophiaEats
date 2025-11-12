//@Deprecated

//package handlers;
//
//import com.sun.net.httpserver.HttpExchange;
//import domain.Dish;
//import domain.OrderItem;
//import repository.CartRepository;
//import repository.RestaurantRepository;
//
//import java.io.IOException;
//import java.util.Optional;
//
//public class CartHandler extends BaseHandler {
//    private final CartRepository carts;
//    private final RestaurantRepository restaurants;
//
//    public CartHandler(CartRepository carts, RestaurantRepository restaurants) {
//        this.carts = carts; this.restaurants = restaurants;
//    }
//
//    @Override
//    public void handle(HttpExchange ex) throws IOException {
//        try {
//            if (ex.getRequestMethod().equals("GET")) { getCart(ex); return; }
//            if (ex.getRequestMethod().equals("POST")) { addToCart(ex); return; }
//            sendText(ex, 405, "Method Not Allowed");
//        } catch (Exception e) { sendText(ex, 500, "Server error: " + e.getMessage()); }
//    }
//
//    private void getCart(HttpExchange ex) throws IOException {
//        var cart = carts.createCart();
//        sendJson(ex, 200, "{\"items\":"+cart.getItems().size()+",\"total\":"+cart.calculateTotal()+"}");
//    }
//
//    // body: dishName|qty|restaurantName
//    private void addToCart(HttpExchange ex) throws IOException {
//        var p = body(ex).trim().split("\\|");
//        if (p.length<3) { sendText(ex, 400, "Expected: dishName|qty|restaurantName"); return; }
//        int qty;
//        try { qty = Integer.parseInt(p[1].trim()); } catch (NumberFormatException e) { sendText(ex, 400, "Invalid qty"); return; }
//        var r = restaurants.findByName(p[2].trim());
//        if (r.isEmpty()) { sendText(ex, 404, "Restaurant not found"); return; }
//        Optional<Dish> dish = r.get().getMenu().stream().filter(d->d.getName().equals(p[0].trim())).findFirst();
//        if (dish.isEmpty()) { sendText(ex, 404, "Dish not found"); return; }
//        carts.createCart().addItem(new OrderItem(dish.get(), qty));
//        sendJson(ex, 201, "{\"added\":\""+esc(dish.get().getName())+"\",\"qty\":"+qty+"}");
//    }
//}

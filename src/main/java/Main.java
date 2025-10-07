import com.sun.net.httpserver.HttpServer;
import domain.*;
import handlers.*;
import repository.*;
<<<<<<< Updated upstream
=======
import service.OrderService;

>>>>>>> Stashed changes
import java.net.InetSocketAddress;
import java.time.LocalDateTime;

import domain.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== SophiaTech Eats - Demo complet ===\n");

<<<<<<< Updated upstream
        // 1️⃣ Creăm un utilizator Campus + credit și alergii
        CampusUser user = new CampusUser("Ana Cristea", "ana@example.com", "Romania");
        user.assignStudentCredit(new StudentCredit(100.0, LocalDate.now().plusDays(30)));
        user.addAllergy(new Allergy("gluten"));
        System.out.println("Utilizator creat: " + user);

        // 2️⃣ Creăm un restaurant + meniu + delivery slots
        Restaurant laFabrica = new Restaurant("La Fabrica", "Italian", "$$");
=======
        var restaurantRepo = new RestaurantRepository();
        var cartRepo = new CartRepository();
        var userRepo = new CampusUserRepository();
        var orderRepo = new OrderRepository();
        var orderService = new OrderService();

        server.createContext("/restaurants", new RestaurantHandler(restaurantRepo));
        server.createContext("/cart", new CartHandler(cartRepo, restaurantRepo));
        server.createContext("/users", new CampusUserHandler(userRepo));
        server.createContext("/orders", new OrderHandler(cartRepo, orderRepo, orderService));

//        var service = new OrderService();
//        var cart = new Cart();
//        cart.addItem(new OrderItem(new Dish("Soup", "Hot", 10.0, DishCategory.STARTER, "Soup"), 2));
//
//        Order o = service.placeOrder(cart, "Cămin A", LocalDateTime.now().plusHours(1));
//        System.out.println("Order placed: " + o);
>>>>>>> Stashed changes

        Dish pizza = new Dish("Pizza Diavola", "Spicy salami pizza", 42.0, DishCategory.MAIN_COURSE, "Pizza");
        pizza.addDietaryTag(DietaryTag.HALAL);
        pizza.addExtraOption(new ExtraOption("Extra Cheese", 5.0));

        Dish pasta = new Dish("Pasta Carbonara", "Creamy pasta with bacon", 38.5, DishCategory.MAIN_COURSE, "Pasta");
        pasta.addDietaryTag(DietaryTag.LACTOSE_FREE);

        laFabrica.addDishToMenu(pizza);
        laFabrica.addDishToMenu(pasta);
        laFabrica.addDeliverySlot(new DeliverySlot(LocalDateTime.now().plusHours(1), 3));

        System.out.println("Restaurant creat: " + laFabrica);
        System.out.println("Meniu: " + laFabrica.getMenu());

        // 3️⃣ Creăm un coș și adăugăm produse
        Cart cart = new Cart(user, laFabrica);
        OrderItem pizzaItem = new OrderItem(pizza, 1);
        pizzaItem.addExtraOption(new ExtraOption("Spicy Oil", 2.0));

        OrderItem pastaItem = new OrderItem(pasta, 2);

        cart.addItem(pizzaItem);
        cart.addItem(pastaItem);

        System.out.println("\nCoșul curent:");
        System.out.println(cart);

        // 4️⃣ Checkout → creăm comanda din coș
        Order order = cart.checkout();

        // 5️⃣ Alegem slot și locație de livrare
        DeliverySlot slot = laFabrica.getDeliverySlots().get(0);
        order.chooseDeliverySlot(slot);

        DeliveryLocation location = new DeliveryLocation("Bâtiment Forum", "Parter - Recepție");
        order.setDeliveryLocation(location);

        // 6️⃣ Plătim cu creditul studentului
        double total = order.getTotalPrice();
        Payment payment = new Payment(PaymentMethod.STUDENT_CREDIT, total);
        payment.process(user);
        order.attachPayment(payment);

        if (payment.isSuccess()) {
            order.validate();
            order.markPaid();
            System.out.println("\n✅ Comanda a fost plătită și validată!");
        } else {
            System.out.println("\n❌ Plata a eșuat - fonduri insuficiente sau credit blocat.");
        }

        // 7️⃣ Rezumat final
        System.out.println("\n=== Rezumat Comandă ===");
        System.out.println(order);
    }
}

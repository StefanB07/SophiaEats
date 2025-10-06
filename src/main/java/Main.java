//package C:\Users\xXRazvanXx\IdeaProjects\ste-25-26-team-u-1\src\main\java\domain;

import domain.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("--- Initializing SophiaTech Eats simulation ---");

        // Create a Restaurant and add dishes to its menu
        Restaurant laFabrica = new Restaurant("La Fabrica", "Italian", "$$");
        Dish pizza = new Dish("Pizza Diavola", "Spicy salami pizza", 42.0, DishCategory.MAIN_COURSE, "Pizza");
        Dish pasta = new Dish("Pasta Carbonara", "Creamy pasta with bacon", 38.5, DishCategory.MAIN_COURSE, "Pasta");
        laFabrica.addDishToMenu(pizza);
        laFabrica.addDishToMenu(pasta);

        System.out.println("\nRestaurant available: " + laFabrica.getName());
        System.out.println("Menu items: " + laFabrica.getMenu());

        // A user (can be anonymous at this stage) starts an order
        System.out.println("\n--- A user starts adding items to the cart ---");
        Cart userCart = new Cart();

        // The user adds items to the cart
        OrderItem item1 = new OrderItem(pizza, 1);
        userCart.addItem(item1);
        System.out.println("Added to cart: " + item1);
        System.out.println("Current Cart State: " + userCart);

        OrderItem item2 = new OrderItem(pasta, 2);
        userCart.addItem(item2);
        System.out.println("Added to cart: " + item2);
        System.out.println("Current Cart State: " + userCart);

        // To finalize the order, the user must be registered
        System.out.println("\n--- User needs to be registered to place the order ---");
        CampusUser registeredUser = new CampusUser("Miruna Popescu", "miruna.p@email.com", "Romania");
        System.out.println("User identified: " + registeredUser.getName());
        System.out.println("The user can now proceed to checkout with the cart content.");

        // From here, you would implement the logic to convert the Cart into an Order for this user.
    }
}

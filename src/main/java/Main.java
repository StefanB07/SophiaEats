import bootstrap.DataSeeder;
import domain.*;
import repository.*;
import service.CartService;
import service.OrderService;

import java.time.LocalDateTime;
import java.util.*;

public class Main {
    private static final Scanner in = new Scanner(System.in);

    public static void main(String[] args) {
        // Wiring repositories
        CampusUserRepository users = new CampusUserRepository();
        RestaurantRepository restaurants = new RestaurantRepository();
        CartRepository carts = new CartRepository();
        OrderRepository orders = new OrderRepository();
        DeliveryCatalogRepository delivery = new DeliveryCatalogRepository();

        // Seed demo data
        DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);

        // Pick a default user for the session
        CampusUser currentUser = users.findAll().isEmpty() ? null : users.findAll().get(0);

        // Services
        CartService cartService = new CartService(carts, restaurants);
        OrderService orderService = new OrderService(delivery, restaurants);

        // Use the Cart observer to recompute available slots after each add
        cartService.addListener((updatedCart, restaurant) -> {
            if (restaurant == null) return;
            int qty = updatedCart.getItems() == null ? 0 : updatedCart.getItems().stream()
                    .mapToInt(OrderItem::getQuantity)
                    .sum();
            var slots = delivery.slotsFor(restaurant.getId());
            var available = new ArrayList<DeliverySlot>();
            for (DeliverySlot s : slots) {
                if (s.canFit(qty)) available.add(s);
            }
            System.out.println("[Observer] Available slots for " + restaurant.getName() + " and qty " + qty + ": "
                    + (available.isEmpty() ? "none" : available.size()));
        });

        // Working state
        Cart cart = (currentUser != null)
                ? cartService.getOrCreateCart(currentUser)
                : carts.createCart();

        System.out.println("Welcome to SophiaTech Eats (CLI demo)\n");
        if (currentUser != null) {
            System.out.println("Logged in as: " + currentUser.getName() + " (" + currentUser.getEmail() + ")");
        } else {
            System.out.println("No campus user found. Some payment methods may be unavailable.");
        }

        List<Restaurant> lastResults = new ArrayList<>(restaurants.findAll());
        Restaurant selectedRestaurant = null;

        mainLoop:
        while (true) {
            System.out.println("\n--- Main Menu ---");
            System.out.println("1) Filter restaurants");
            System.out.println("2) List all restaurants");
            System.out.println("3) Select a restaurant from last results");
            System.out.println("4) View restaurant menu and add to cart");
            System.out.println("5) View cart");
            System.out.println("6) Place order");
            System.out.println("0) Exit");
            System.out.print("> ");

            String choice = in.nextLine().trim();
            try {
                switch (choice) {
                    case "1":
                        lastResults = doFilter(restaurants);
                        selectedRestaurant = null; // reset selection
                        break;
                    case "2":
                        lastResults = new ArrayList<>(restaurants.findAll());
                        printRestaurants(lastResults);
                        selectedRestaurant = null;
                        break;
                    case "3":
                        if (lastResults.isEmpty()) {
                            System.out.println("No restaurants in last results. Use option 1 or 2 first.");
                            break;
                        }
                        selectedRestaurant = chooseRestaurant(lastResults);
                        break;
                    case "4":
                        if (selectedRestaurant == null) {
                            System.out.println("No restaurant selected. Use option 3 to pick one.");
                            break;
                        }
                        addItemsToCart(cartService, cart, selectedRestaurant);
                        break;
                    case "5":
                        printCart(cart);
                        break;
                    case "6":
                        placeOrderFlow(cart, orderService, delivery, restaurants, orders, currentUser);
                        // After placing: cart is cleared by placeOrder. For logged-in users we keep the same cart object.
                        if (currentUser == null) {
                            cart = carts.createCart();
                        }
                        selectedRestaurant = null;
                        break;
                    case "0":
                        break mainLoop;
                    default:
                        System.out.println("Unknown option");
                }
            } catch (Exception e) {
                System.out.println("! Error: " + e.getMessage());
            }
        }

        System.out.println("Goodbye!");
    }

    // --- UI helpers ---

    private static List<Restaurant> doFilter(RestaurantRepository restaurants) {
        FilterCriteria c = new FilterCriteria();

        System.out.print("Cuisine (blank=any): ");
        String cuisine = in.nextLine().trim();
        if (!cuisine.isBlank()) c.setCuisineType(cuisine);

        System.out.print("Price range (e.g., $, $$, $$$; blank=any): ");
        String price = in.nextLine().trim();
        if (!price.isBlank()) c.setPriceRange(price);

        System.out.print("Dietary tag (e.g., vegan, vegetarian; blank=any): ");
        String tag = in.nextLine().trim();
        if (!tag.isBlank()) c.setDietaryTag(tag);

        System.out.print("Only available now? (y/N): ");
        String only = in.nextLine().trim();
        if (only.equalsIgnoreCase("y") || only.equalsIgnoreCase("yes")) c.setOnlyAvailable(true);

        List<Restaurant> results = RestaurantFilters.filter(restaurants.findAll(), c);
        if (results.isEmpty()) {
            System.out.println("No restaurants match your filter.");
        } else {
            printRestaurants(results);
        }
        return results;
    }

    private static void printRestaurants(List<Restaurant> list) {
        System.out.println("\nRestaurants:");
        int i = 1;
        for (Restaurant r : list) {
            System.out.printf("%d) %s — %s — %s — %d dishes%n",
                    i++, r.getName(), r.getCuisineType(), r.getPriceRange(), r.getMenu().size());
        }
    }

    private static Restaurant chooseRestaurant(List<Restaurant> list) {
        printRestaurants(list);
        System.out.print("Pick number: ");
        int idx = readInt(1, list.size());
        Restaurant r = list.get(idx - 1);
        System.out.println("Selected: " + r.getName());
        return r;
    }

    private static void addItemsToCart(CartService cartService, Cart cart, Restaurant r) {
        if (r.getMenu().isEmpty()) {
            System.out.println("This restaurant has no dishes.");
            return;
        }
        System.out.println("\nMenu for " + r.getName() + ":");
        int i = 1;
        for (Dish d : r.getMenu()) {
            System.out.printf("%d) %s - %.2f (%s)%n", i++, d.getName(), d.getPrice(), d.getCategory());
        }
        System.out.print("Dish number (0=done): ");
        int idx = readInt(0, r.getMenu().size());
        if (idx == 0) return;
        Dish selected = r.getMenu().get(idx - 1);
        System.out.print("Quantity: ");
        int qty = readInt(1, 100);
        cartService.addItem(cart, r, selected, qty);
        System.out.println("Added " + qty + " x " + selected.getName() + " to cart.");
    }

    private static void printCart(Cart cart) {
        if (cart.getItems().isEmpty()) {
            System.out.println("Cart is empty.");
            return;
        }
        System.out.println("\nCart:");
        for (OrderItem it : cart.getItems()) {
            System.out.printf("- %dx %s — total %.2f%n", it.getQuantity(), it.getDish().getName(), it.getTotalPrice());
        }
        System.out.printf("Total: %.2f%n", cart.calculateTotal());
    }

    private static void placeOrderFlow(Cart cart,
                                       OrderService orderService,
                                       DeliveryCatalogRepository delivery,
                                       RestaurantRepository restaurants,
                                       OrderRepository orders,
                                       CampusUser currentUser) {
        if (cart.getItems().isEmpty()) {
            System.out.println("Cart is empty.");
            return;
        }

        // Derive restaurant from cart items (OrderService enforces single-restaurant rule too)
        Restaurant fromCart = deriveRestaurantFromCart(cart, restaurants);
        if (fromCart == null) {
            System.out.println("Could not determine restaurant from cart or multiple restaurants detected.");
            return;
        }

        // Choose delivery location
        List<DeliveryLocation> locs = new ArrayList<>(delivery.allLocations());
        if (locs.isEmpty()) {
            System.out.println("No delivery locations configured.");
            return;
        }
        System.out.println("\nDelivery locations:");
        for (int i = 0; i < locs.size(); i++) {
            System.out.printf("%d) %s%n", i + 1, locs.get(i).getName());
        }
        System.out.print("Pick location: ");
        int locIdx = readInt(1, locs.size());
        String place = locs.get(locIdx - 1).getName();
        String description = locs.get(locIdx - 1).getDescription();

        // Choose a time slot (show remaining capacity)
        List<DeliverySlot> slots = delivery.slotsFor(fromCart.getId());
        LocalDateTime when;
        if (slots.isEmpty()) {
            when = LocalDateTime.now().plusMinutes(30);
            System.out.println("No predefined slots; using: " + when);
        } else {
            int totalQty = cart.getItems().stream().mapToInt(OrderItem::getQuantity).sum();
            System.out.println("Available slots (remaining capacity shown):");
            for (int i = 0; i < slots.size(); i++) {
                DeliverySlot s = slots.get(i);
                System.out.printf("%d) %s  [remaining=%d]%n", i + 1, s.getLabel(), s.getRemainingCapacity());
            }
            System.out.print("Pick slot: ");
            int slotIdx = readInt(1, slots.size());
            when = slots.get(slotIdx - 1).getStart();
            // Note: if the chosen slot cannot fit totalQty, OrderService will reject it gracefully
        }

        // Place and persist order
        Order order = orderService.placeOrder(cart, new DeliveryLocation(place, description), when);
        orders.save(order);
        System.out.println("\nOrder created: " + order.getId());
        System.out.println("Delivery to: " + order.getDeliveryPlace() + " at " + order.getDeliveryTime());
        printCartSummary(order);
        System.out.println("Status: " + order.getStatus());

        // Payment: loop until success or user opts out
        boolean paid = false;
        while (!paid) {
            PaymentMethod method = choosePaymentMethod();
            try {
                if (method == PaymentMethod.STUDENT_CREDIT) {
                    if (currentUser == null) {
                        System.out.println("No logged user available for STUDENT_CREDIT. Falling back to EXTERNAL.");
                        method = PaymentMethod.EXTERNAL;
                    } else if (currentUser.getStudentCredit() == null) {
                        System.out.print("Enter initial student credit budget (e.g., 100): ");
                        double budget = readDoubleMin(0);
                        currentUser.assignStudentCredit(new StudentCredit(budget));
                    }
                }
                var payment = orderService.pay(order, method, currentUser);
                orders.save(order);
                System.out.println("Payment processed via " + payment.getMethod() + ": " + (payment.isSuccess() ? "ACCEPTED" : "DECLINED"));
                System.out.println("Status -> " + order.getStatus() + (order.getPaidAt() != null ? (" at " + order.getPaidAt()) : ""));
                paid = payment.isSuccess();
            } catch (Exception e) {
                System.out.println("Payment failed: " + e.getMessage());
                System.out.print("Try another payment method? (y/N): ");
                String retry = in.nextLine().trim();
                if (!(retry.equalsIgnoreCase("y") || retry.equalsIgnoreCase("yes"))) {
                    System.out.println("Leaving order in CREATED status. You can retry payment later.");
                    break;
                }
            }
        }

        // Show remaining capacity of chosen slot after reservation (reservation happens at order creation)
        delivery.findSlot(fromCart.getId(), slots.isEmpty() ? "" : slots.stream()
                .filter(s -> s.getStart().equals(when))
                .findFirst().map(DeliverySlot::getLabel).orElse(""))
                .ifPresent(s -> System.out.println("Slot '" + s.getLabel() + "' remaining capacity: " + s.getRemainingCapacity()));

        // Offer delivery update only if paid
        if (order.getStatus() == OrderStatus.PAID) {
            System.out.print("Mark as delivered now? (y/N): ");
            String ans = in.nextLine().trim();
            if (ans.equalsIgnoreCase("y") || ans.equalsIgnoreCase("yes")) {
                try {
                    orderService.markAsDelivered(order);
                    orders.save(order);
                    System.out.println("Order delivered. Status -> " + order.getStatus() + (order.getDeliveredAt() != null ? (" at " + order.getDeliveredAt()) : ""));
                } catch (Exception e) {
                    System.out.println("Cannot mark delivered: " + e.getMessage());
                }
            }
        } else {
            System.out.println("Order not paid. Skipping delivery step.");
        }
    }

    private static void printCartSummary(Order order) {
        System.out.println("Items:");
        for (OrderItem it : order.getItems()) {
            System.out.printf("- %dx %s — total %.2f%n", it.getQuantity(), it.getDish().getName(), it.getTotalPrice());
        }
        System.out.printf("Total: %.2f%n", order.getTotal());
    }

    private static int readInt(int min, int max) {
        while (true) {
            String s = in.nextLine().trim();
            try {
                int v = Integer.parseInt(s);
                if (v < min || v > max) throw new NumberFormatException();
                return v;
            } catch (NumberFormatException e) {
                System.out.print("Enter a number between " + min + " and " + max + ": ");
            }
        }
    }

    private static double readDoubleMin(double min) {
        while (true) {
            String s = in.nextLine().trim();
            try {
                double v = Double.parseDouble(s);
                if (v < min) throw new NumberFormatException();
                return v;
            } catch (NumberFormatException e) {
                System.out.print("Enter a number >= " + min + ": ");
            }
        }
    }

    private static PaymentMethod choosePaymentMethod() {
        System.out.println("Payment method: 1) EXTERNAL  2) STUDENT_CREDIT");
        System.out.print("Pick: ");
        int pick = readInt(1, 2);
        return pick == 2 ? PaymentMethod.STUDENT_CREDIT : PaymentMethod.EXTERNAL;
    }

    private static Restaurant deriveRestaurantFromCart(Cart cart, RestaurantRepository restaurants) {
        if (cart.getItems().isEmpty()) return null;
        // Find restaurant containing the first dish
        Dish firstDish = cart.getItems().get(0).getDish();
        Optional<Restaurant> r = restaurants.findAll().stream()
                .filter(rest -> rest.getMenu().contains(firstDish))
                .findFirst();
        if (r.isEmpty()) return null;
        Restaurant found = r.get();
        // Validate all items belong to same restaurant
        boolean single = cart.getItems().stream().allMatch(it -> found.getMenu().contains(it.getDish()));
        return single ? found : null;
    }
}

import bootstrap.DataSeeder;
import domain.catalog.*;
import domain.order.*;
import repository.*;
import repository.interfaces.*;
import service.CartService;
import service.OrderService;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

public class Main {
    private static final Scanner in = new Scanner(System.in);

    public static void main(String[] args) {
        // Wiring repositories
        CampusUserRepository users = new repository.jdbc.JdbcCampusUserRepository();
        RestaurantRepository restaurants = new repository.jdbc.JdbcRestaurantRepository();
        CartRepository carts = new repository.jdbc.JdbcCartRepository();
        OrderRepository orders = new repository.jdbc.JdbcOrderRepository();
        DeliveryCatalogRepository delivery = new repository.jdbc.JdbcDeliveryCatalogRepository();

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

         // Role selection (costumer/manager)
        System.out.println("Welcome to SophiaTech Eats\n");
        String role = chooseRole();
        if ("2".equals(role)) {
            // Manager flow only, then exit.
            managerFlow(restaurants, delivery);
            System.out.println("Goodbye!");
            return;
        }

        // Working state
        Cart cart = (currentUser != null)
                ? cartService.getOrCreateCart(currentUser)
                : carts.createCart();

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

    // Menu flows
    private static String chooseRole() {
        System.out.println("Choose role: 1) Customer  2) Restaurant Manager");
        System.out.print("Pick: ");
        String choice = in.nextLine().trim();
        if (!"1".equals(choice) && !"2".equals(choice)) {
            System.out.println("Defaulting to Customer.");
            return "1";
        }
        return choice;
    }

    private static void managerFlow(RestaurantRepository restaurants, DeliveryCatalogRepository delivery) {
        List<Restaurant> list = new ArrayList<>(restaurants.findAll());
        if (list.isEmpty()) {
            System.out.println("No restaurants available to manage.");
            return;
        }
        System.out.println("\n--- Manager: pick a restaurant to manage ---");
        Restaurant managed = chooseRestaurant(list);

        while (true) {
            System.out.println("\n--- Manager Menu for '" + managed.getName() + "' ---");
            System.out.println("1) Add a dish");
            System.out.println("2) Update a dish"); // changed numbering
            System.out.println("3) Manage delivery time intervals/capacities"); // shifted to 3
            System.out.println("0) Exit");
            System.out.print("> ");
            String pick = in.nextLine().trim();
            if ("0".equals(pick)) break;
            switch (pick) {
                case "1":
                    addDishFlow(managed, restaurants);
                    break;
                case "2":
                    updateDishFlow(managed, restaurants); // new flow
                    break;
                case "3":
                    manageTimeIntervalsFlow(managed, delivery);
                    break;
                default:
                    System.out.println("Unknown option");
            }
        }
    }

    private static void addDishFlow(Restaurant managed, RestaurantRepository restaurants) {
        System.out.println("\nAdd new dish to '" + managed.getName() + "'");
        System.out.print("Dish name: ");
        String name = in.nextLine();
        if (name.isEmpty()) {
            System.out.println("Name cannot be empty. Aborting.");
            return;
        }
        System.out.print("Description: ");
        String description = in.nextLine();
        if (description.isEmpty()) {
            System.out.println("Description cannot be empty. Aborting.");
            return;
        }
        System.out.print("Price: ");
        double price = readDoubleMin(0);
        DishCategory category = pickDishCategory();
        System.out.print("Specific type (blank=none): ");
        String type = in.nextLine().trim();
        if (type.isBlank()) type = null;

        Dish dish = new Dish(name, description, price, category, type);
        managed.addDishToMenu(dish);
        restaurants.save(managed);
        System.out.println("Added dish: " + dish.getName() + " (" + category + ") to '" + managed.getName() + "'. Total dishes: " + managed.getMenu().size());
    }

    private static void updateDishFlow(Restaurant managed, RestaurantRepository restaurants) {
        if (managed.getMenu().isEmpty()) {
            System.out.println("No dishes to update.");
            return;
        }
        while (true) {
            System.out.println("\nDishes for '" + managed.getName() + "':");
            int i = 1;
            for (Dish d : managed.getMenu()) {
                System.out.println(i++ + ") " + d.getName() + " - " + String.format(java.util.Locale.US, "%.2f", d.getPrice()) + " (" + d.getCategory() + ")");
            }
            System.out.print("Pick dish to update (0=back): ");
            int idx = readInt(0, managed.getMenu().size());
            if (idx == 0) return;
            Dish dish = managed.getMenu().get(idx - 1);
            updateSingleDish(dish);
            restaurants.save(managed); // persist changes
        }
    }

    private static void updateSingleDish(Dish dish) {
        while (true) {
            System.out.println("\nUpdating dish: " + dish.getName());
            System.out.println("Current description: " + dish.getDescription());
            System.out.println("Current price: " + dish.getPrice());
            System.out.println("Current category: " + dish.getCategory());
            System.out.println("Current type: " + (dish.getType() == null ? "(none)" : dish.getType()));
            System.out.println("Dietary tags: " + (dish.getDietaryTags().isEmpty() ? "(none)" : dish.getDietaryTags()));
            System.out.println("Options:");
            System.out.println("1) Change name");
            System.out.println("2) Change description");
            System.out.println("3) Change price");
            System.out.println("4) Change category");
            System.out.println("5) Change type");
            System.out.println("6) Add dietary tag");
            System.out.println("7) Remove dietary tag");
            System.out.println("0) Back");
            System.out.print("> ");
            String pick = in.nextLine().trim();
            switch (pick) {
                case "0":
                    return;
                case "1":
                    System.out.print("New name: ");
                    String nn = in.nextLine().trim();
                    if (!nn.isBlank()) forceSetField(dish, "name", nn);
                    break;
                case "2":
                    System.out.print("New description: ");
                    String nd = in.nextLine().trim();
                    if (!nd.isBlank()) forceSetField(dish, "description", nd);
                    break;
                case "3":
                    System.out.print("New price: ");
                    double p = readDoubleMin(0);
                    dish.setPrice(p);
                    break;
                case "4":
                    DishCategory cat = pickDishCategory();
                    forceSetField(dish, "category", cat);
                    break;
                case "5":
                    System.out.print("New type (blank=none): ");
                    String tp = in.nextLine().trim();
                    forceSetField(dish, "type", tp.isBlank() ? null : tp);
                    break;
                case "6":
                    DietaryTag tag = pickDietaryTag();
                    if (tag != null) dish.addDietaryTag(tag);
                    break;
                case "7":
                    removeDietaryTag(dish);
                    break;
                default:
                    System.out.println("Unknown choice");
            }
        }
    }

    private static DietaryTag pickDietaryTag() {
        System.out.println("Pick dietary tag:");
        DietaryTag[] vals = DietaryTag.values();
        for (int i = 0; i < vals.length; i++) {
            System.out.println((i + 1) + ") " + vals[i]);
        }
        System.out.print("Tag number (0=cancel): ");
        int idx = readInt(0, vals.length);
        if (idx == 0) return null;
        return vals[idx - 1];
    }

    private static void removeDietaryTag(Dish dish) {
        if (dish.getDietaryTags().isEmpty()) {
            System.out.println("No tags to remove.");
            return;
        }
        System.out.println("Dietary tags:");
        for (int i = 0; i < dish.getDietaryTags().size(); i++) {
            System.out.println((i + 1) + ") " + dish.getDietaryTags().get(i));
        }
        System.out.print("Remove which (0=cancel): ");
        int idx = readInt(0, dish.getDietaryTags().size());
        if (idx == 0) return;
        dish.getDietaryTags().remove(idx - 1);
    }

    private static void forceSetField(Object target, String fieldName, Object value) {
        try {
            var f = target.getClass().getDeclaredField(fieldName);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            System.out.println("Cannot update field '" + fieldName + "': " + e.getMessage());
        }
    }

    private static DishCategory pickDishCategory() {
        System.out.println("Pick category:");
        DishCategory[] values = DishCategory.values();
        for (int i = 0; i < values.length; i++) {
            System.out.println((i + 1) + ") " + values[i]);
        }
        System.out.print("Category number: ");
        int idx = readInt(1, values.length);
        return values[idx - 1];
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
            System.out.printf("%d) %s â€” %s â€” %s â€” %d dishes%n",
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
            System.out.println(i++ + ") " + d.getName() + " - " + String.format(java.util.Locale.US, "%.2f", d.getPrice()) + " (" + d.getCategory() + ")");
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
            System.out.printf("- %dx %s â€” total %.2f%n", it.getQuantity(), it.getDish().getName(), it.getTotalPrice());
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
            System.out.printf("- %dx %s â€” total %.2f%n", it.getQuantity(), it.getDish().getName(), it.getTotalPrice());
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

    // Time interval management flow
    private static void manageTimeIntervalsFlow(Restaurant managed, DeliveryCatalogRepository delivery) {
        String restId = managed.getId();
        while (true) {
            System.out.println("\nOptions: 1) Add interval  0) Back");
            System.out.print("> ");
            String pick = in.nextLine().trim();
            if ("0".equals(pick)) return;
            if (pick.equals("1")) {
                addFreeFormInterval();
            } else {
                System.out.println("Unknown option");
            }
        }
    }

    private static void addFreeFormInterval() {
        System.out.println("Enter interval. Type 0 to cancel.");
        System.out.print("from HH:HH - ");
        String start = in.nextLine();
        if (start == null) return;
        start = start.trim();
        if (start.equals("0")) return;
        System.out.print("to HH:HH - ");
        String end = in.nextLine();
        if (end == null) return;
        end = end.trim();
        if (end.equals("0")) return;
        if (start.isEmpty() || end.isEmpty()) {
            System.out.println("Input cancelled (empty start/end).");
            return;
        }
        var tStart = parseFlexibleTime(start);
        var tEnd = parseFlexibleTime(end);
        if (tStart == null || tEnd == null) {
            System.out.println("Invalid time format. Please use HH:MM or H:MM (e.g., 11:00, 9:30).");
            return;
        }
        if (!tStart.isBefore(tEnd)) {
            System.out.println("Invalid interval. Start time must be before end time.");
            return;
        }

        System.out.println("A new time interval has been added from " + start + " to " + end);
    }

    private static LocalTime parseFlexibleTime(String s) {
        s = s.trim();
        List<DateTimeFormatter> fmts = List.of(
                DateTimeFormatter.ofPattern("H:mm"),
                DateTimeFormatter.ofPattern("HH:mm")
        );
        for (DateTimeFormatter f : fmts) {
            try {
                return LocalTime.parse(s, f);
            } catch (DateTimeParseException ignored) { }
        }
        try {
            int h = Integer.parseInt(s);
            if (h >= 0 && h <= 23) return LocalTime.of(h, 0);
        } catch (NumberFormatException ignored) { }
        return null;
    }
}


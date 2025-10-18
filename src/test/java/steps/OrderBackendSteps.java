package steps;

import domain.*;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import repository.*;
import service.CartService;
import service.OrderService;
import bootstrap.DataSeeder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class OrderBackendSteps {
    private CampusUser currentUser;
    private CampusUserRepository users;
    private RestaurantRepository restaurants;
    private CartRepository carts;
    private OrderRepository orders;
    private DeliveryCatalogRepository delivery;

    private CartService cartService;
    private OrderService orderService;

    private Cart cart;
    private Restaurant selectedRestaurant;
    private Order lastOrder;
    private Exception lastError;

    @Before
    public void setup() {
        users = new CampusUserRepository();
        restaurants = new RestaurantRepository();
        carts = new CartRepository();
        orders = new OrderRepository();
        delivery = new DeliveryCatalogRepository();
        DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);

        cartService = new CartService(carts, restaurants);
        orderService = new OrderService(delivery, restaurants);

        cart = null;
        selectedRestaurant = null;
        lastOrder = null;
        lastError = null;
    }

    @Given("I am a Campus User")
    public void i_am_a_campus_user() { /* user exists from seeder, no-op */ }

    @Given("I have an empty cart")
    public void i_have_an_empty_cart() { cart = carts.createCart(); }

    @Given("I choose restaurant {string}")
    public void i_choose_restaurant(String name) {
        Optional<Restaurant> r = restaurants.findByName(name);
        assertTrue(r.isPresent(), "Restaurant not found: " + name);
        selectedRestaurant = r.get();
    }

    @Given("I am a Campus User {string} with credit {double}")
    public void i_am_a_campus_user_with_credit(String name, double credit) {
        CampusUser u = new CampusUser(name, name + "@campus", "Dorm A");
        u.getStudentCredit().setBudget(credit);
        users.save(u);
        currentUser = u;
    }

    @Given("I add {int} dish from the restaurant to the cart")
    public void i_add_dish_from_the_restaurant_to_the_cart(Integer qty) {
        assertNotNull(selectedRestaurant, "No restaurant selected");
        assertFalse(selectedRestaurant.getMenu().isEmpty(), "Selected restaurant has no dishes");
        Dish dish = selectedRestaurant.getMenu().get(0);
        cartService.addItem(cart, selectedRestaurant, dish, qty);
    }

    @When("I place an order to location {string} for the next available slot")
    public void i_place_an_order_to_location_for_the_next_available_slot(String place) {
        try {
            List<DeliverySlot> slots = new ArrayList<>(delivery.slotsFor(selectedRestaurant.getId()));
            LocalDateTime when = slots.isEmpty() ? LocalDateTime.now().plusMinutes(30) : slots.get(0).getStart();
            lastOrder = orderService.placeOrder(cart, place, when);
            orders.save(lastOrder);
            lastError = null;
        } catch (Exception e) {
            lastError = e;
        }
    }

    @Then("the order is created with status {string}")
    public void the_order_is_created_with_status(String status) {
        assertNotNull(lastOrder, lastError == null ? "Order was not created" : lastError.getMessage());
        assertEquals(OrderStatus.valueOf(status), lastOrder.getStatus());
    }

    @Then("the order has delivery location {string}")
    public void the_order_has_delivery_location(String place) {
        assertNotNull(lastOrder);
        assertEquals(place, lastOrder.getDeliveryPlace());
    }

    @When("I try to place an order to location {string}")
    public void i_try_to_place_an_order_to_location(String place) {
        try {
            lastOrder = orderService.placeOrder(cart, place, LocalDateTime.now().plusMinutes(30));
            lastError = null;
        } catch (Exception e) {
            lastOrder = null;
            lastError = e;
        }
    }

    @Then("the order is rejected with an error")
    public void the_order_is_rejected_with_an_error() {
        assertNotNull(lastError, "Expected an error but none occurred");
    }

    @When("I try to place an order to location {string} at a past time")
    public void i_try_to_place_an_order_to_location_at_a_past_time(String place) {
        try {
            lastOrder = orderService.placeOrder(cart, place, LocalDateTime.now().minusMinutes(30));
            lastError = null;
        } catch (Exception e) {
            lastOrder = null;
            lastError = e;
        }
    }

    @When("I pay the order with EXTERNAL method")
    public void i_pay_the_order_with_external_method() {
        assertNotNull(lastOrder, "No order created to pay");
        Payment p = orderService.pay(lastOrder, PaymentMethod.EXTERNAL, currentUser);
        assertTrue(p.isSuccess(), "Payment should be accepted in simulation");
        orders.save(lastOrder);
    }

    @When("I pay the order with STUDENT_CREDIT method")
    public void i_pay_with_credit() {
        assertNotNull(lastOrder, "No order created");
        assertNotNull(currentUser, "No current user set");
        try {
            Payment p = orderService.pay(lastOrder, PaymentMethod.STUDENT_CREDIT, currentUser);
            assertTrue(p.isSuccess());
            orders.save(lastOrder);
            lastError = null;
        } catch (Exception e) {
            lastError = e;
        }
    }

    @When("I try to pay the order with STUDENT_CREDIT method")
    public void i_try_to_pay_with_student_credit() {
        assertNotNull(lastOrder, "No order created");
        assertNotNull(currentUser, "No current user set");
        try {
            Payment lastPayment = orderService.pay(lastOrder, PaymentMethod.STUDENT_CREDIT, currentUser);
            orders.save(lastOrder);
            lastError = null; // dacă ajunge aici, nu a aruncat excepție
        } catch (Exception e) {
            lastError = e;    // captăm eroarea pentru Then "rejected with an error ..."
        }
    }

    @Then("the order is in status {string}")
    public void the_order_is_in_status(String status) {
        assertNotNull(lastOrder);
        assertEquals(OrderStatus.valueOf(status), lastOrder.getStatus());
    }

    @When("I mark the order delivered")
    public void i_mark_the_order_delivered() {
        assertNotNull(lastOrder);
        orderService.markAsDelivered(lastOrder);
        orders.save(lastOrder);
    }

    @When("I try to mark the order delivered")
    public void i_try_to_mark_the_order_delivered() {
        try {
            assertNotNull(lastOrder, "No order created to deliver");
            orderService.markAsDelivered(lastOrder);
            orders.save(lastOrder);
            lastError = null;
        } catch (Exception e) {
            lastError = e;
        }
    }

    @Then("the user {string} STUDENT_CREDIT becomes {double}")
    public void the_user_student_credit_becomes(String username, Double expected) {
        CampusUser u = null;

        try {
            var opt = users.findById(username);
            if (opt != null && opt.isPresent()) {
                u = opt.get();
            }
        } catch (Throwable ignored) { }

        if (u == null) {
            try {
                var all = users.findAll();
                if (all != null) {
                    u = all.stream()
                            .filter(x -> username.equals(x.getName()))
                            .findFirst().orElse(null);
                }
            } catch (Throwable ignored) {  }
        }

        if (u == null && currentUser != null && username.equals(currentUser.getName())) {
            u = currentUser;
        }

        assertNotNull(u, "User not found in repository: " + username);
        assertNotNull(u.getStudentCredit(), "User has no StudentCredit: " + username);

        assertEquals(expected, u.getStudentCredit().getBudget(), 0.0001);
    }


    @Then("the order total is {double}")
    public void orderTotalIs(double expectedTotal) {
        assertEquals(expectedTotal, lastOrder.getTotal());
    }


    @Then("my cart is empty")
    public void cartIsEmpty() {
        assertTrue(cart.getItems().isEmpty());
    }


    @Given("I am a Campus User {string} with STUDENT_CREDIT {double}")
    public void i_am_a_campus_user_with_student_credit(String name, Double credit) {
        CampusUser u = new CampusUser(name, name + "@campus", "Dorm A");

        if (u.getStudentCredit() == null) {
            u.setStudentCredit(new StudentCredit());
        }
        u.getStudentCredit().setBudget(credit);

        users.save(u);
        currentUser = u;
    }

    @Given("I add {int} dish {string} at price {double}")
    public void i_add_dish_at_price(Integer qty, String dishName, Double price) {
        assertNotNull(selectedRestaurant, "No restaurant selected");
        Optional<Dish> dishOpt = selectedRestaurant.getMenu().stream()
                .filter(d -> d.getName().equals(dishName))
                .findFirst();
        assertTrue(dishOpt.isPresent(), "Dish not found in restaurant menu: " + dishName);
        Dish dish = dishOpt.get();
        cartService.addItem(cart, selectedRestaurant, dish, qty);
    }

    @Then("the order is rejected with an error {string}")
    public void the_order_is_rejected_with_an_error(String expected) {
        assertNotNull(lastError, "Expected an error but none occurred");
        assertEquals(expected, lastError.getMessage(),
                "Unexpected error: " + lastError.getMessage());
    }

    @Given("the current price of {string} becomes {double}")
    public void the_current_price_of_becomes(String dishName, Double newPrice) {
        assertNotNull(selectedRestaurant, "No restaurant selected");
        selectedRestaurant.getMenu().stream()
                .filter(d -> d.getName().equals(dishName))
                .findFirst()
                .ifPresent(d -> d.setPrice(newPrice));
    }
}

package steps;

import domain.*;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import repository.*;
import service.CartService;
import service.OrderService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class OrderBackendSteps {
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

    @Given("a fresh backend context")
    public void a_fresh_backend_context() { /* done in setup */ }

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
        Payment p = orderService.pay(lastOrder, PaymentMethod.EXTERNAL);
        assertTrue(p.isSuccess(), "Payment should be accepted in simulation");
        orders.save(lastOrder);
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
}

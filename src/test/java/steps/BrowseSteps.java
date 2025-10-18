package steps;

import bootstrap.DataSeeder;
import domain.*;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import repository.*;
import service.CartService;
import service.OrderService;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class BrowseSteps {
    // Backend context per scenario
    private CampusUserRepository users;
    private RestaurantRepository restaurants;
    private CartRepository carts;
    private OrderRepository orders;
    private DeliveryCatalogRepository delivery;

    private CartService cartService;
    private OrderService orderService;

    private boolean loggedIn;
    private List<Restaurant> listedRestaurants;
    private List<Dish> listedDishes;

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

        loggedIn = false;
        listedRestaurants = new ArrayList<>();
        listedDishes = new ArrayList<>();
    }

    @Given("a fresh backend context")
    public void a_fresh_backend_context() {
        // already done in @Before
    }

    @Given("I am not logged in")
    public void i_am_not_logged_in() { loggedIn = false; }

    @Given("I am logged in")
    public void i_am_logged_in() { loggedIn = true; }

    @When("I access SophiaTech Eats")
    public void i_access_sophiatech_eats() {
        listedRestaurants = new ArrayList<>(restaurants.findAll());
        listedDishes = new ArrayList<>();
        for (Restaurant r : listedRestaurants) {
            listedDishes.addAll(r.getMenu());
        }
    }

    @Then("I can list restaurants and dishes")
    public void i_can_list_restaurants_and_dishes() {
        assertNotNull(listedRestaurants);
        assertTrue(listedRestaurants.size() > 0, "No restaurants available");
        assertNotNull(listedDishes);
        assertTrue(listedDishes.size() > 0, "No dishes available");
    }

    @Then("I cannot place an order without selecting items")
    public void i_cannot_place_an_order_without_selecting_items() {
        Cart cart = carts.createCart();
        Exception ex = assertThrows(IllegalArgumentException.class,
                () -> orderService.placeOrder(cart, "Bât A", java.time.LocalDateTime.now().plusMinutes(30)));
        assertTrue(ex.getMessage().toLowerCase().contains("cart"));
    }

    @When("I browse restaurant menus")
    public void i_browse_restaurant_menus() {
        listedRestaurants = new ArrayList<>(restaurants.findAll());
        listedDishes = new ArrayList<>();
        for (Restaurant r : listedRestaurants) {
            listedDishes.addAll(r.getMenu());
        }
    }

    @Then("I see dishes with names and prices")
    public void i_see_dishes_with_names_and_prices() {
        assertFalse(listedDishes.isEmpty(), "No dishes loaded");
        assertTrue(listedDishes.stream().allMatch(d -> d.getName() != null && !d.getName().isBlank()), "Dish without name");
        assertTrue(listedDishes.stream().allMatch(d -> d.getPrice() > 0), "Dish without positive price");
    }

    @Then("at least one dish has dietary tags")
    public void at_least_one_dish_has_dietary_tags() {
        boolean anyWithTags = listedDishes.stream().anyMatch(d -> d.getDietaryTags() != null && !d.getDietaryTags().isEmpty());
        assertTrue(anyWithTags, "Expected at least one dish to have dietary tags");
    }
}

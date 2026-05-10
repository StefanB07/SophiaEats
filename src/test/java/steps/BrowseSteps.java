// java
package steps;

import bootstrap.DataSeeder;
import domain.order.DeliveryLocation;
import domain.catalog.Dish;
import domain.catalog.Restaurant;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import repository.CampusUserRepository;
import repository.CartRepository;
import repository.DeliveryCatalogRepository;
import repository.OrderRepository;
import repository.RestaurantRepository;
import service.OrderService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class BrowseSteps {
    // Minimal backend context for browsing + the Ã¢â‚¬Å“cannot orderÃ¢â‚¬Â check
    private RestaurantRepository restaurants;
    private CartRepository carts;
    private DeliveryCatalogRepository delivery;
    private OrderService orderService;

    private boolean loggedIn;
    private List<Restaurant> listedRestaurants;
    private List<Dish> listedDishes;

    @Before
    public void setup() {
        // Repos needed to seed demo data
        var users = new repository.InMemoryCampusUserRepository();
        restaurants = new repository.InMemoryRestaurantRepository();
        carts = new repository.InMemoryCartRepository();
        var orders = new repository.InMemoryOrderRepository();
        delivery = new repository.InMemoryDeliveryCatalogRepository();

        DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);

        orderService = new OrderService(delivery, restaurants);

        loggedIn = false;
        listedRestaurants = new ArrayList<>();
        listedDishes = new ArrayList<>();
    }

    @Given("I am not logged in")
    public void i_am_not_logged_in() {
        loggedIn = false;
    }

    @Given("I am logged in")
    public void i_am_logged_in() {
        loggedIn = true;
    }

    @When("I access SophiaTech Eats")
    public void i_access_sophiatech_eats() {
        listedRestaurants = new ArrayList<>(restaurants.findAll());
        assertFalse(listedRestaurants.isEmpty(), "No restaurants available");
    }

    @When("I browse restaurant menus")
    public void i_browse_restaurant_menus() {
        if (listedRestaurants == null || listedRestaurants.isEmpty()) {
            listedRestaurants = new ArrayList<>(restaurants.findAll());
        }
        listedDishes = new ArrayList<>();
        for (Restaurant r : listedRestaurants) {
            listedDishes.addAll(r.getMenu());
        }
        assertFalse(listedDishes.isEmpty(), "No dishes available");
    }

    @Then("I see all dish information including tags and prices.")
    public void i_see_all_dish_information_including_tags_and_prices() {
        assertFalse(listedDishes.isEmpty(), "No dishes loaded");
        assertTrue(listedDishes.stream().allMatch(d ->
                d.getName() != null && !d.getName().isBlank()
                        && d.getDescription() != null && !d.getDescription().isBlank()
                        && d.getPrice() > 0), "Dish missing name/description or non-positive price");
        boolean anyWithTags = listedDishes.stream().anyMatch(d -> d.getDietaryTags() != null && !d.getDietaryTags().isEmpty());
        assertTrue(anyWithTags, "Expected at least one dish to have dietary tags");
    }

    @Then("I can see dishes from restaurants but cannot order.")
    public void i_can_see_dishes_but_cannot_order() {
        assertNotNull(listedRestaurants);
        assertFalse(listedRestaurants.isEmpty(), "No restaurants available");
        listedDishes = new ArrayList<>();
        for (Restaurant r : listedRestaurants) listedDishes.addAll(r.getMenu());
        assertFalse(listedDishes.isEmpty(), "No dishes available");

        var cart = carts.createCart();
        
//        Exception ex = assertThrows(IllegalArgumentException.class,
//                () -> orderService.placeOrder(cart, "BÃƒÂ¢t A", LocalDateTime.now().plusMinutes(30)));
//        assertTrue(ex.getMessage().toLowerCase().contains("cart"));
        DeliveryLocation location = delivery.findLocation("BÃƒÂ¢t A")
                .orElseThrow(() -> new IllegalArgumentException("Invalid delivery location: BÃƒÂ¢t A"));

        Exception ex = assertThrows(IllegalArgumentException.class,
                () -> orderService.placeOrder(cart, location, LocalDateTime.now().plusMinutes(30)));
        assertTrue(ex.getMessage().toLowerCase().contains("cart"));
    }
}

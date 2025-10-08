package steps;

import domain.*;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import repository.RestaurantRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class RestaurantFilterSteps {
    private RestaurantRepository repo;
    private List<Restaurant> results;

    @Given("a fresh restaurant repository")
    public void a_fresh_restaurant_repository() {
        repo = new RestaurantRepository();
        results = null;
    }

    @When("I filter by cuisine {string}")
    public void i_filter_by_cuisine(String cuisine) {
        FilterCriteria c = new FilterCriteria();
        c.setCuisineType(cuisine);
        results = RestaurantFilters.filter(repo.findAll(), c);
    }

    @When("I filter by dietary {string}")
    public void i_filter_by_dietary(String dietary) {
        FilterCriteria c = new FilterCriteria();
        c.setDietaryTag(dietary);
        results = RestaurantFilters.filter(repo.findAll(), c);
    }

    @When("I filter only available")
    public void i_filter_only_available() {
        FilterCriteria c = new FilterCriteria();
        c.setOnlyAvailable(true);
        results = RestaurantFilters.filter(repo.findAll(), c);
    }

    @Then("I get {int} restaurants")
    public void i_get_n_restaurants(Integer n) {
        assertNotNull(results, "You must run a filter first");
        assertEquals(n.intValue(), results.size(), "Unexpected number of restaurants: " + results);
    }

    @Then("the result includes {string}")
    public void the_result_includes(String name) {
        assertNotNull(results);
        assertTrue(results.stream().anyMatch(r -> r.getName().equals(name)),
                "Expected results to include '" + name + "' but were: " + results);
    }

    @Then("the result does not include {string}")
    public void the_result_does_not_include(String name) {
        assertNotNull(results);
        assertTrue(results.stream().noneMatch(r -> r.getName().equals(name)),
                "Expected results NOT to include '" + name + "' but were: " + results);
    }

    @Given("restaurant {string} is open {word}")
    public void restaurant_is_open(String name, String openWord) {
        boolean open = Boolean.parseBoolean(openWord);
        var r = repo.findByName(name);
        assertTrue(r.isPresent(), "Restaurant not found: " + name);
        r.get().setOpen(open);
    }

    @Given("in {string} dish {string} has dietary tag {string}")
    public void dish_has_dietary_tag(String restName, String dishName, String tagText) {
        var r = repo.findByName(restName);
        assertTrue(r.isPresent(), "Restaurant not found: " + restName);
        Optional<Dish> dish = r.get().getMenu().stream().filter(d -> d.getName().equals(dishName)).findFirst();
        assertTrue(dish.isPresent(), "Dish not found: " + dishName);
        DietaryTag tag = decodeDietary(tagText);
        dish.get().addDietaryTag(tag);
    }

    private DietaryTag decodeDietary(String tagText) {
        for (DietaryTag t : DietaryTag.values()) {
            if (DietaryTag.matches(t, tagText)) return t;
        }
        fail("Unknown dietary tag: " + tagText);
        return null;
    }
}


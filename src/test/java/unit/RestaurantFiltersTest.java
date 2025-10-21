package unit;

import domain.*;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RestaurantFiltersTest {

    private Restaurant makeRestaurant(String name, String cuisine, String price, boolean open, Dish... dishes) {
        Restaurant r = new Restaurant(name, cuisine, price);
        r.setOpen(open);
        for (Dish d : dishes) r.addDishToMenu(d);
        return r;
    }

    @Test
    void filterByCuisineAndAvailability() {
        Restaurant r1 = makeRestaurant("A", "Italian", "$$", true,
                new Dish("Pizza", "", 10.0, DishCategory.MAIN_COURSE, ""));
        Restaurant r2 = makeRestaurant("B", "Japanese", "$$$", false,
                new Dish("Ramen", "", 12.0, DishCategory.MAIN_COURSE, ""));

        FilterCriteria c = new FilterCriteria();
        c.setCuisineType("Italian");
        List<Restaurant> out = RestaurantFilters.filter(List.of(r1, r2), c);
        assertEquals(1, out.size());
        assertEquals("A", out.get(0).getName());

        FilterCriteria onlyAvail = new FilterCriteria();
        onlyAvail.setOnlyAvailable(true);
        List<Restaurant> avail = RestaurantFilters.filter(List.of(r1, r2), onlyAvail);
        assertEquals(1, avail.size());
        assertEquals("A", avail.get(0).getName());
    }

    @Test
    void filterByDietaryTagAndPrice() {
        Dish vegan = new Dish("Bowl", "", 9.0, DishCategory.MAIN_COURSE, "");
        vegan.addDietaryTag(DietaryTag.VEGAN);
        Restaurant r1 = makeRestaurant("A", "Fusion", "$", true, vegan);
        Restaurant r2 = makeRestaurant("B", "Fusion", "$$$", true,
                new Dish("Steak", "", 20.0, DishCategory.MAIN_COURSE, ""));

        FilterCriteria veganOnly = new FilterCriteria();
        veganOnly.setDietaryTag("vegan");
        List<Restaurant> veganRes = RestaurantFilters.filter(List.of(r1, r2), veganOnly);
        assertEquals(1, veganRes.size());
        assertEquals("A", veganRes.get(0).getName());

        FilterCriteria expensive = new FilterCriteria();
        expensive.setPriceRange("$$$");
        List<Restaurant> pricey = RestaurantFilters.filter(List.of(r1, r2), expensive);
        assertEquals(1, pricey.size());
        assertEquals("B", pricey.get(0).getName());
    }
}


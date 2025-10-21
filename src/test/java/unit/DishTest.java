package unit;

import domain.DietaryTag;
import domain.Dish;
import domain.DishCategory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DishTest {

    @Test
    void gettersAndSetters_work() {
        Dish d = new Dish("Soup", "Hot soup", 5.0, DishCategory.STARTER, "liquid");
        assertEquals("Soup", d.getName());
        assertEquals(5.0, d.getPrice(), 0.0001);
        d.setPrice(6.5);
        assertEquals(6.5, d.getPrice(), 0.0001);
        assertEquals(DishCategory.STARTER, d.getCategory());
        assertNotNull(d.getId());
    }

    @Test
    void dietaryTags_and_hasDietaryTag_areCaseInsensitive() {
        Dish d = new Dish("Bowl", "", 9.0, DishCategory.MAIN_COURSE, "");
        d.addDietaryTag(DietaryTag.GLUTEN_FREE);
        assertTrue(d.hasDietaryTag("gluten-free"));
        assertTrue(d.hasDietaryTag("GLUTEN-FREE"));
        assertFalse(d.hasDietaryTag("vegan"));
    }
}


package unit;

import domain.FilterCriteria;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FilterCriteriaTest {

    @Test
    void setters_storeValues_andOnlyAvailableFlag() {
        FilterCriteria c = new FilterCriteria();
        assertFalse(c.isOnlyAvailable());
        c.setOnlyAvailable(true);
        assertTrue(c.isOnlyAvailable());

        c.setCuisineType("Italian");
        c.setPriceRange("$$");
        c.setDietaryTag("vegan");
        c.setEstablishmentType("RESTAURANT");

        assertTrue(c.getCuisineType().isPresent());
        assertEquals("Italian", c.getCuisineType().get());
        assertTrue(c.getPriceRange().isPresent());
        assertEquals("$$", c.getPriceRange().get());
        assertTrue(c.getDietaryTag().isPresent());
        assertEquals("vegan", c.getDietaryTag().get());
        assertTrue(c.getEstablishmentType().isPresent());
        assertEquals("RESTAURANT", c.getEstablishmentType().get());
    }
}


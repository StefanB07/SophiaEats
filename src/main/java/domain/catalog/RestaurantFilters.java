package domain.catalog;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public final class RestaurantFilters {
    private RestaurantFilters() {}

    public static List<Restaurant> filter(Collection<Restaurant> restaurants, FilterCriteria criteria) {
        return restaurants.stream()
                .filter(r -> !criteria.isOnlyAvailable() || (r.isOpen() ))
                .filter(r -> criteria.getCuisineType().isEmpty() ||
                        r.getCuisineType().equalsIgnoreCase(criteria.getCuisineType().get()))
                .filter(r -> criteria.getDietaryTag().isEmpty() ||
                        r.offersDietaryTag(criteria.getDietaryTag().get()))
                .filter(r -> criteria.getPriceRange().isEmpty() ||
                        r.getPriceRange().equalsIgnoreCase(criteria.getPriceRange().get()))
                .filter(r -> criteria.getEstablishmentType().isEmpty() ||
                        r.getType().equalsIgnoreCase(criteria.getEstablishmentType().get()))
                .collect(Collectors.toList());
    }
}



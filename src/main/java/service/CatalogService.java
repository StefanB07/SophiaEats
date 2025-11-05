package service;

import domain.FilterCriteria;
import domain.Restaurant;
import repository.RestaurantRepository;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class CatalogService {
    private final RestaurantRepository restaurants;

    public CatalogService(RestaurantRepository restaurants) {
        this.restaurants = Objects.requireNonNull(restaurants);
    }

    public List<Restaurant> listAll() {
        return restaurants.findAll().stream().toList();
    }

    public java.util.Optional<Restaurant> findByName(String name) {
        return restaurants.findByName(name);
    }

    public List<Restaurant> filter(FilterCriteria criteria) {
        return restaurants.findAll().stream()
                .filter(r -> !criteria.isOnlyAvailable() || (r.isOpen()))
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


package service;

import domain.DeliveryLocation;
import domain.DeliverySlot;
import domain.FilterCriteria;
import domain.Restaurant;
import repository.DeliveryCatalogRepository;
import repository.RestaurantRepository;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class CatalogService {
    private final RestaurantRepository restaurants;
    private final DeliveryCatalogRepository delivery;

    public CatalogService(RestaurantRepository restaurants, DeliveryCatalogRepository delivery) {
        this.restaurants = Objects.requireNonNull(restaurants);
        this.delivery = Objects.requireNonNull(delivery);
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

    public Set<DeliveryLocation> getAllLocations() {
        return delivery.allLocations();
    }

    public List<DeliverySlot> getSlotsForRestaurant(String restaurantName) {
        var restOpt = restaurants.findByName(restaurantName);
        if (restOpt.isEmpty()) {
            return List.of();
        }
        return delivery.slotsFor(restOpt.get().getId());
    }
}


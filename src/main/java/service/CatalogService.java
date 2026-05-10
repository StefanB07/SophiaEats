package service;

import domain.catalog.*;
import domain.order.*;
import repository.interfaces.DeliveryCatalogRepository;
import repository.interfaces.RestaurantRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class CatalogService {
    private final RestaurantRepository restaurants;
    private final DeliveryCatalogRepository delivery;
    public static record SlotUpdate(String label, int capacity) {}


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

//    public DeliverySlot addOrUpdateSlot(String restaurantName, LocalDateTime start, int capacity) {
//        var rest = restaurants.findByName(restaurantName)
//                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found: " + restaurantName));
//
//        return delivery.addOrUpdateSlot(rest.getId(), start, capacity);
//    }


    /**
     * R2 â€“ Add a new dish to an existing restaurant.
     * In-memory only (uses RestaurantRepository).
     */
    public Dish addDishToRestaurant(
            String restaurantName,
            String name,
            String description,
            double price,
            DishCategory category,
            String type,
            String dietaryInfo
    ) {
        Optional<Restaurant> opt = restaurants.findByName(restaurantName);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Restaurant not found: " + restaurantName);
        }

        Restaurant r = opt.get();

        // ÃŽn modelul vostru, ultimul parametru din constructorul Dish este info / composition.
        // Eu folosesc dietaryInfo dacÄƒ e dat, altfel type.
        String info = (dietaryInfo != null && !dietaryInfo.isBlank())
                ? dietaryInfo
                : (type != null ? type : "");

        Dish dish = new Dish(name, description, price, category, info);

        // ÃŽn viitor poÈ›i sÄƒ adaugi È™i tags / toppings aici.
        // de exemplu: tags.forEach(dish::addDietaryTag);

        r.addDishToMenu(dish);
        restaurants.save(r); // persistÄƒ modificarea Ã®n repo-ul in-memory

        return dish;
    }

    /**
     * R2 â€“ Update an existing dish for a restaurant.
     * Uses dish name as identifier (unique per restaurant).
     */
    public Dish updateDishForRestaurant(
            String restaurantName,
            String existingDishName, // old name (from the URL/path)
            String newName,
            String description,
            double price,
            DishCategory category,
            String type
    ) {
        Optional<Restaurant> opt = restaurants.findByName(restaurantName);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Restaurant not found: " + restaurantName);
        }

        Restaurant r = opt.get();
        List<Dish> menu = r.getMenu();

        for (int i = 0; i < menu.size(); i++) {
            Dish d = menu.get(i);
            if (d.getName().equals(existingDishName)) {
                // Create a new Dish with the new values and replace it
                Dish updated = new Dish(
                        newName != null && !newName.isBlank() ? newName : d.getName(),
                        description != null ? description : d.getDescription(),
                        price > 0 ? price : d.getPrice(),
                        category != null ? category : d.getCategory(),
                        type != null ? type : d.getType()
                );

                // TODO: dacÄƒ ai tag-uri / toppings pe dish vechi, aici le poÈ›i copia pe cel nou.

                menu.set(i, updated);
                restaurants.save(r);
                return updated;
            }
        }

        throw new IllegalArgumentException(
                "Dish '" + existingDishName + "' not found in restaurant '" + restaurantName + "'."
        );
    }

    public void deleteDishForRestaurant(String restaurantName, String dishName) {
        var restOpt = restaurants.findByName(restaurantName);
        if (restOpt.isEmpty()) {
            throw new IllegalArgumentException("Restaurant not found: " + restaurantName);
        }

        var r = restOpt.get();
        boolean removed = r.getMenu().removeIf(d -> d.getName().equals(dishName));
        if (!removed) {
            throw new IllegalArgumentException("Dish not found: " + dishName);
        }
    }

    public void updateSlotsForRestaurant(String restaurantName, java.util.List<SlotUpdate> updates) {
        var restOpt = restaurants.findByName(restaurantName);
        if (restOpt.isEmpty()) {
            throw new IllegalArgumentException("Restaurant not found: " + restaurantName);
        }
        var restaurant = restOpt.get();

        // MapÄƒm label -> capacity pentru update rapid
        java.util.Map<String, Integer> newCaps = updates.stream()
                .collect(java.util.stream.Collectors.toMap(
                        SlotUpdate::label,
                        SlotUpdate::capacity,
                        (a, b) -> b
                ));

        delivery.updateSlotCapacities(restaurant.getId(), newCaps);
    }

    public DeliverySlot addSlotForRestaurant(String restaurantName, LocalDateTime start, int capacity) {
        Restaurant r = restaurants.findByName(restaurantName)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found: " + restaurantName));
        return delivery.addSlot(r.getId(), start, capacity);
    }

    public void deleteSlotForRestaurant(String restaurantName, String label) {
        Restaurant r = restaurants.findByName(restaurantName)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found: " + restaurantName));
        boolean removed = delivery.deleteSlot(r.getId(), label);
        if (!removed) {
            throw new IllegalArgumentException("Slot not found for label: " + label);
        }
    }


}



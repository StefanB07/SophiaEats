package domain;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class Restaurant {
    private final String id;
    private String name;
    private String cuisine;
    private String priceRange;
    private List<Dish> menu;
    private List<DeliverySlot> deliverySlots;

    // Constructor with params
    public Restaurant(String name, String cuisine, String priceRange) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.cuisine = cuisine;
        this.priceRange = priceRange;
        this.menu = new ArrayList<>();
        this.deliverySlots = new ArrayList<>();
    }

    // Getters
    public String getId() {
        return id;
    }
    public String getName() {
        return name;
    }

    public String getCuisineType() {
        return cuisine;
    }

    public String getPriceRange() {
        return priceRange;
    }


    public void addDishToMenu(Dish dish) {
        menu.add(dish);
    }

    public List<Dish> getMenu() {
        return menu;
    }

    // Functions
    public void addDeliverySlot(DeliverySlot slot) {
        deliverySlots.add(slot);
    }

    public List<DeliverySlot> getDeliverySlots() {
        return deliverySlots;
    }

    public List<Dish> filterByDietaryTag(DietaryTag tag) {
        return menu.stream()
                .filter(d -> d.getDietaryTags().contains(tag))
                .collect(Collectors.toList());
    }

    @Override
    public String toString() {
        return "Restaurant{" +
                "name='" + name + '\'' +
                ", cuisine='" + cuisine + '\'' +
                ", menu size=" + menu.size() +
                '}';
    }
}

package domain;

import java.time.LocalDateTime;
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
    private boolean open = true; // added mutable open flag for tests and filters

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
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCuisineType() { return cuisine; }
    public String getPriceRange() { return priceRange; }

    public void addDishToMenu(Dish dish) { menu.add(dish); }
    public List<Dish> getMenu() { return menu; }

    // Functions
    public void addDeliverySlot(DeliverySlot slot) { deliverySlots.add(slot); }
    public List<DeliverySlot> getDeliverySlots() { return deliverySlots; }

    public List<Dish> filterByDietaryTag(DietaryTag tag) {
        return menu.stream()
                .filter(d -> d.getDietaryTags().contains(tag))
                .collect(Collectors.toList());
    }

    // --- Availability helpers used by RestaurantFilters ---
    public boolean isOpen() {
        // Respect explicit open/closed flag first
        if (!open) return false;
        // Optionally consider slots; if none, treat as open
        if (deliverySlots == null || deliverySlots.isEmpty()) return true;
        LocalDateTime now = LocalDateTime.now();
        return deliverySlots.stream().anyMatch(s -> s.getStart().isAfter(now));
    }

    public void setOpen(boolean open) { this.open = open; }

    // @deprecated because isOpen() covers this IDENTICALLY
//    public boolean hasAvailableCapacity() {
//        // If closed, capacity is irrelevant (treated as unavailable)
//        if (!open) return false;
//        if (deliverySlots == null || deliverySlots.isEmpty()) return true;
//        LocalDateTime now = LocalDateTime.now();
//        return deliverySlots.stream().anyMatch(s -> s.getStart().isAfter(now));
//    }

    public boolean offersDietaryTag(String tagLabel) {
        if (tagLabel == null || tagLabel.isBlank()) return false;
        return menu != null && menu.stream().anyMatch(d -> d.hasDietaryTag(tagLabel));
    }

    public String getType() { return "RESTAURANT"; }

    @Override
    public String toString() {
        return "Restaurant{" +
                "name='" + name + '\'' +
                ", cuisine='" + cuisine + '\'' +
                ", menu size=" + menu.size() +
                '}';
    }
}

package domain;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Restaurant {

    private String name;
    private String cuisineType;
    private String type; // restaurant, crous, foodtruck
    private String priceRange; // cheap, medium, expensive
    private boolean open;
    private int maxCapacity;
    private int currentOrders;

    private List<Dish> menu;
    private List<DeliverySlot> deliverySlots;

    // ---------------------- Constructors ----------------------

    public Restaurant(String name, String cuisineType, String priceRange) {
        this(name, cuisineType, "restaurant", priceRange, true, 10);
    }

    public Restaurant(String name, String cuisineType, String type, String priceRange, boolean open, int maxCapacity) {
        this.name = name;
        this.cuisineType = cuisineType;
        this.type = type;
        this.priceRange = priceRange;
        this.open = open;
        this.maxCapacity = maxCapacity;
        this.currentOrders = 0;
        this.menu = new ArrayList<>();
        this.deliverySlots = new ArrayList<>();
    }

    // ---------------------- Getters & Setters ----------------------

    public String getName() { return name; }

    public String getCuisineType() { return cuisineType; }

    public String getPriceRange() { return priceRange; }

    public String getType() { return type; }

    public boolean isOpen() { return open; }

    public void setOpen(boolean open) { this.open = open; }

    public int getMaxCapacity() { return maxCapacity; }

    public int getCurrentOrders() { return currentOrders; }

    public void incrementOrders() { currentOrders++; }

    public void resetOrders() { currentOrders = 0; }

    public List<Dish> getMenu() { return menu; }

    public List<DeliverySlot> getDeliverySlots() { return deliverySlots; }

    // ---------------------- Domain Methods ----------------------

    public void addDishToMenu(Dish dish) {
        menu.add(dish);
    }

    public void addDeliverySlot(DeliverySlot slot) {
        deliverySlots.add(slot);
    }


     //Check if the restaurant still has available capacity (for open ones).
    public boolean hasAvailableCapacity() {
        return currentOrders < maxCapacity;
    }

     //Checks if the restaurant offers at least one dish matching a dietary tag.
    public boolean offersDietaryTag(String tag) {
        return menu.stream()
                .anyMatch(d -> d.getDietaryTags() != null &&
                        d.getDietaryTags().stream()
                                .anyMatch(t -> t.name().replace("_", "-").equalsIgnoreCase(tag)));
    }


     //Filters dishes in this restaurant by a specific dietary tag.
    public List<Dish> filterByDietaryTag(DietaryTag tag) {
        return menu.stream()
                .filter(d -> d.getDietaryTags().contains(tag))
                .collect(Collectors.toList());
    }

    @Override
    public String toString() {
        return "Restaurant{" +
                "name='" + name + '\'' +
                ", cuisineType='" + cuisineType + '\'' +
                ", type='" + type + '\'' +
                ", open=" + open +
                ", capacity=" + currentOrders + "/" + maxCapacity +
                ", menu size=" + menu.size() +
                '}';
    }
}

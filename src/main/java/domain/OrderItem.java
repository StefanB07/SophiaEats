package domain;

import java.util.ArrayList;
import java.util.List;

public class OrderItem {

    private Dish dish;
    private int quantity;
    private String restaurantName;
    private List<ExtraOption> extraOptions;

    public OrderItem(Dish dish, int quantity, String restaurantName) {
        this.dish = dish;
        this.quantity = quantity;
        this.restaurantName = restaurantName;
        this.extraOptions = new ArrayList<>();
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void addExtraOptions(ExtraOption option) {
        extraOptions.add(option);
    }

    // Getters
    public Dish getDish() {
        return dish;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getTotalPrice() {
        double base = dish.getPrice() * quantity;
        double extras = extraOptions.stream().mapToDouble(ExtraOption::getPrice).sum() * quantity;
        return base + extras;
    }

    public String toString() {
        return "OrderItem{" +
                "dish=" + dish.getName() +
                ", quantity=" + quantity +
                ", total=" + getTotalPrice() +
                '}';
    }
}

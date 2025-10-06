package domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents the temporary shopping cart for any user (registered or not).
 */
public class Cart {
    private LocalDateTime createdAt;
    private List<OrderItem> items;

    public Cart() {
        this.createdAt = LocalDateTime.now();
        this.items = new ArrayList<>();
    }

    public void addItem(OrderItem item) {
        // In a real app, you would check if the dish is already in the cart and just update the quantity.
        this.items.add(item);
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public double calculateTotal() {
        double total = 0.0;
        for (OrderItem item : items) {
            total += item.getTotalPrice();
        }
        return total;
    }

    @Override
    public String toString() {
        return "Cart{" +
                "items=" + items +
                ", total=" + calculateTotal() +
                '}';
    }
}

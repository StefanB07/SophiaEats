package domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents the temporary shopping cart for any user (registered or not).
 */
public class Cart {
    private final String id;
    private LocalDateTime createdAt;
    private List<OrderItem> items;
    // Optional owner association (null for anonymous)
    private String ownerUserId;

    public Cart() {
        this.id = UUID.randomUUID().toString();
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

    public void clear() {
        this.items.clear();
    }

    public String getId() {
        return id;
    }

    // --- Owner association (optional) ---
    public String getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }

    @Override
    public String toString() {
        return "Cart{" +
                "items=" + items +
                ", total=" + calculateTotal() +
                '}';
    }
}
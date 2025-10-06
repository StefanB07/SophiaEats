package domain;

import java.util.ArrayList;
import java.util.List;

public class Cart {

    private CampusUser user;
    private Restaurant restaurant;
    private List<OrderItem> items;

    // === Constructor vechi (fără parametri) păstrat pentru handler ===
    public Cart() {
        this.items = new ArrayList<>();
    }

    // === Constructor nou pentru integrare completă ===
    public Cart(CampusUser user, Restaurant restaurant) {
        this();
        this.user = user;
        this.restaurant = restaurant;
    }

    public void addItem(OrderItem item) {
        items.add(item);
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public double getTotal() {
        return items.stream().mapToDouble(OrderItem::getTotalPrice).sum();
    }

    public void clear() {
        items.clear();
    }

    /**
     * Creează o comandă pe baza conținutului coșului.
     */
    public Order checkout() {
        if (items.isEmpty()) throw new IllegalStateException("Cart is empty");
        Order order = new Order(user, restaurant);
        for (OrderItem item : items) {
            order.addItem(item);
        }
        return order;
    }

    public CampusUser getUser() {
        return user;
    }

    public void setUser(CampusUser user) {
        this.user = user;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }


    @Override
    public String toString() {
        return "Cart{" +
                "user=" + user.getName() +
                ", restaurant=" + restaurant.getName() +
                ", items=" + items +
                ", total=" + getTotal() +
                '}';
    }

    public String calculateTotal() {
        double total = getTotal();
        return String.format("Total cart value: %.2f €", total);
    }
}

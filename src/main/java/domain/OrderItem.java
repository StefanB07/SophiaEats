package domain;

public class OrderItem {
    private Dish dish;
    private int quantity;

    public OrderItem(Dish dish, int quantity) {
        this.dish = dish;
        this.quantity = quantity;
    }

    // Getters
    public Dish getDish() {
        return dish;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getTotalPrice() {
        return dish.getPrice() * quantity;
    }

    @Override
    public String toString() {
        return quantity + " x " + dish.getName() + " (" + getTotalPrice() + " RON)";
    }
}

package domain;

public class Dish {
    private String name;
    private String description;
    private double price; // Using double for simplicity instead of a Money class
    private DishCategory category;
    private String type; // e.g., "Pizza", "Pasta"

    public Dish(String name, String description, double price, DishCategory category, String type) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.type = type;
    }

    // Getters
    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    @Override
    public String toString() {
        return "Dish{" +
                "name='" + name + '\'' +
                ", price=" + price +
                '}';
    }
}

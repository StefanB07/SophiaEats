package domain.catalog;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class Dish {
    private String id; // adÄƒugat pentru identificare unicÄƒ
    private String name;
    private String description;
    private double price;
    private DishCategory category;
    private String type;
    private List<DietaryTag> dietaryTags;

    // === Constructor pÄƒstrat pentru compatibilitate handler ===
    public Dish(String name, String description, double price, DishCategory category, String type) {
        this.id = java.util.UUID.randomUUID().toString(); // generare ID unic
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.type = type;
        this.dietaryTags = new ArrayList<>();
    }

    // === Getteri folosiÈ›i Ã®n handler ===
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public double getPrice() {
        return price;
    }

    public DishCategory getCategory() {
        return category;
    }

    public String getType() {
        return type;
    }

    // === FuncÈ›ionalitÄƒÈ›i noi ===
    public void addDietaryTag(DietaryTag tag) {
        dietaryTags.add(tag);
    }

    public List<DietaryTag> getDietaryTags() {
        return dietaryTags;
    }

    // VerificÄƒ dacÄƒ preparatul are un anumit tag alimentar.
    //  Exemplu: dish.hasDietaryTag("gluten-free")
    public boolean hasDietaryTag(String tag) {
        return dietaryTags != null &&
                dietaryTags.stream()
                        .anyMatch(t -> t.name().replace("_", "-").equalsIgnoreCase(tag));
    }

    @Override
    public String toString() {
        return name + " (" + price + "â‚¬)";
    }

    public void setPrice(Double newPrice) {
        this.price = newPrice;
    }
}


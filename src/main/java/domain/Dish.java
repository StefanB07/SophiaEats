package domain;

import java.util.ArrayList;
import java.util.List;

public class Dish {

    private String name;
    private String description;
    private double price;
    private DishCategory category;
    private String type;

    // câmpuri suplimentare
    private List<DietaryTag> dietaryTags;
    private List<ExtraOption> extraOptions;

    // === Constructor păstrat pentru compatibilitate handler ===
    public Dish(String name, String description, double price, DishCategory category, String type) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.type = type;
        this.dietaryTags = new ArrayList<>();
        this.extraOptions = new ArrayList<>();
    }

    // === Getteri folosiți în handler ===
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

    // === Funcționalități noi ===
    public void addDietaryTag(DietaryTag tag) {
        dietaryTags.add(tag);
    }

    public List<DietaryTag> getDietaryTags() {
        return dietaryTags;
    }

    public void addExtraOption(ExtraOption option) {
        extraOptions.add(option);
    }

    public List<ExtraOption> getExtraOptions() {
        return extraOptions;
    }

    // Verifică dacă preparatul are un anumit tag alimentar.
    //  Exemplu: dish.hasDietaryTag("gluten-free")
    public boolean hasDietaryTag(String tag) {
        return dietaryTags != null &&
                dietaryTags.stream()
                        .anyMatch(t -> t.name().replace("_", "-").equalsIgnoreCase(tag));
    }

    @Override
    public String toString() {
        return name + " (" + price + "€)";
    }
}

package domain;

import java.util.ArrayList;
import java.util.List;

public class Restaurant {
    private String name;
    private String cuisineType;
    private String priceRange;
    private List<Dish> menu;

    public Restaurant(String name, String cuisineType, String priceRange) {
        this.name = name;
        this.cuisineType = cuisineType;
        this.priceRange = priceRange;
        this.menu = new ArrayList<>();
    }

    public void addDishToMenu(Dish dish) {
        this.menu.add(dish);
    }

    public List<Dish> getMenu() {
        return menu;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "Restaurant{" +
                "name='" + name + '\'' +
                ", cuisineType='" + cuisineType + '\'' +
                '}';
    }
}

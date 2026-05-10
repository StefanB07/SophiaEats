package domain.catalog;

public enum DietaryTag {
    VEGAN,
    VEGETARIAN,
    GLUTEN_FREE,
    LACTOSE_FREE,
    HALAL,
    KOSHER;

    public static boolean matches(DietaryTag tag, String input) {
        return tag.name().replace("_", "-").equalsIgnoreCase(input);
    }
}



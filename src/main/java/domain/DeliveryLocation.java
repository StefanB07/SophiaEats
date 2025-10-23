package domain;

public class DeliveryLocation {
    private String name;
    private String description;

    public DeliveryLocation(String name, String description) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Delivery location name must not be blank");
        }
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return "DeliveryLocation{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}

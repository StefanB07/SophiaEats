package domain;

public class DeliveryLocation {
    private String name;
    private String description;

    public DeliveryLocation(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "DeliveryLocation{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}

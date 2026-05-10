package domain.catalog;

public class ExtraOption {

    private String name;
    private double price;

    public ExtraOption(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public double getPrice() {
        return price;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "ExtraOption{" +
                "name='" + name + '\'' +
                ", price=" + price +
                '}';
    }
}



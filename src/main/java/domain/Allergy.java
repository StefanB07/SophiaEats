package domain;

public class Allergy {
    private String label;

    public Allergy(String label) {
        this.label = label;
    }
    public String getLabel() {
        return label;
    }
    public void setLabel(String label) {
        this.label = label;
    }

    @Override
    public String toString() {
        return "Allergy{" +
                "label='" + label + '\'' +
                '}';
    }
}

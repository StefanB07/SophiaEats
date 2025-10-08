package domain;

import java.util.Optional;

public class FilterCriteria {
    private Optional<String> cuisineType = Optional.empty();
    private Optional<String> dietaryTag = Optional.empty();
    private Optional<String> priceRange = Optional.empty();
    private Optional<String> establishmentType = Optional.empty();
    private boolean onlyAvailable = false;

    public Optional<String> getCuisineType() { return cuisineType; }
    public void setCuisineType(String cuisineType) { this.cuisineType = Optional.ofNullable(cuisineType); }

    public Optional<String> getDietaryTag() { return dietaryTag; }
    public void setDietaryTag(String dietaryTag) { this.dietaryTag = Optional.ofNullable(dietaryTag); }

    public Optional<String> getPriceRange() { return priceRange; }
    public void setPriceRange(String priceRange) { this.priceRange = Optional.ofNullable(priceRange); }

    public Optional<String> getEstablishmentType() { return establishmentType; }
    public void setEstablishmentType(String establishmentType) { this.establishmentType = Optional.ofNullable(establishmentType); }

    public boolean isOnlyAvailable() { return onlyAvailable; }
    public void setOnlyAvailable(boolean onlyAvailable) { this.onlyAvailable = onlyAvailable; }
}

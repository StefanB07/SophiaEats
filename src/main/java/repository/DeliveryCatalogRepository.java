package repository;

import domain.DeliveryLocation;
import domain.DeliverySlot;

import java.util.*;

public class DeliveryCatalogRepository {
    private final Set<DeliveryLocation> campusLocations = new HashSet<>();
    private final Map<String, List<DeliverySlot>> slotsByRestaurant = new HashMap<>();

    public void clear() {
        campusLocations.clear();
        slotsByRestaurant.clear();
    }

    // --- Locations ---
    public void addLocation(DeliveryLocation loc) { campusLocations.add(loc); }
    public boolean isValidLocation(String name) {
        return campusLocations.stream().anyMatch(l -> l.getName().equalsIgnoreCase(name));
    }
    public Optional<DeliveryLocation> findLocation(String name) {
        return campusLocations.stream().filter(l -> l.getName().equalsIgnoreCase(name)).findFirst();
    }
    public Set<DeliveryLocation> allLocations() { return Collections.unmodifiableSet(campusLocations); }

    // --- Slots ---
    public void setSlots(String restaurantId, List<DeliverySlot> slots) {
        slotsByRestaurant.put(restaurantId, new ArrayList<>(slots));
    }

    public List<DeliverySlot> slotsFor(String restaurantId) {
        return slotsByRestaurant.getOrDefault(restaurantId, List.of());
    }

    public Optional<DeliverySlot> findSlot(String restaurantId, String label) {
        return slotsFor(restaurantId).stream()
                .filter(s -> s.getLabel().equalsIgnoreCase(label))
                .findFirst();
    }

}

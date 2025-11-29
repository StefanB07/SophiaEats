package repository;

import domain.DeliveryLocation;
import domain.DeliverySlot;

import java.time.LocalDateTime;
import java.util.*;

public class DeliveryCatalogRepository {
    private final Set<DeliveryLocation> campusLocations = new HashSet<>();
    private final Map<String, List<DeliverySlot>> slotsByRestaurant = new HashMap<>();

    public void clear() {
        campusLocations.clear();
        slotsByRestaurant.clear();
    }

    // --- Locations ---
    public void addLocation(DeliveryLocation loc) {
        campusLocations.add(loc);
    }

    public boolean isValidLocation(String name) {
        return campusLocations.stream().anyMatch(l -> l.getName().equalsIgnoreCase(name));
    }

    public Optional<DeliveryLocation> findLocation(String name) {
        return campusLocations.stream().filter(l -> l.getName().equalsIgnoreCase(name)).findFirst();
    }

    public Set<DeliveryLocation> allLocations() {
        return Collections.unmodifiableSet(campusLocations);
    }

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

    public void updateSlotCapacities(String restaurantId, Map<String, Integer> capacitiesByLabel) {
        List<DeliverySlot> list = slotsByRestaurant.get(restaurantId);
        if (list == null) return;

        for (DeliverySlot s : list) {
            Integer newCap = capacitiesByLabel.get(s.getLabel());
            if (newCap != null) {
                s.setCapacity(newCap);
            }
        }
    }

    // --- NEW: add a new slot for a restaurant ---
    public DeliverySlot addSlot(String restaurantId, LocalDateTime start, int capacity) {
        List<DeliverySlot> list = slotsByRestaurant
                .computeIfAbsent(restaurantId, id -> new ArrayList<>());

        DeliverySlot slot = new DeliverySlot(start, capacity);
        list.add(slot);

        // opțional: le sortăm după label ca să apară într-o ordine stabilă
        list.sort(Comparator.comparing(DeliverySlot::getLabel));

        return slot;
    }

    // --- NEW: delete a slot by its label ---
    public boolean deleteSlot(String restaurantId, String label) {
        List<DeliverySlot> list = slotsByRestaurant.get(restaurantId);
        if (list == null) return false;

        return list.removeIf(s -> s.getLabel().equalsIgnoreCase(label));
    }

    // în DeliveryCatalogRepository
    public boolean consumeCapacity(String restaurantId, String label) {
        List<DeliverySlot> list = slotsByRestaurant.get(restaurantId);
        if (list == null) return false;

        Iterator<DeliverySlot> it = list.iterator();
        while (it.hasNext()) {
            DeliverySlot s = it.next();
            if (s.getLabel().equalsIgnoreCase(label)) {
                int newCap = s.getCapacity() - 1;
                if (newCap <= 0) {
                    it.remove();           // când ajunge la 0, dispare slotul
                } else {
                    s.setCapacity(newCap);  // altfel doar decrementăm
                }
                return true;
            }
        }
        return false; // nu am găsit slotul
    }

}

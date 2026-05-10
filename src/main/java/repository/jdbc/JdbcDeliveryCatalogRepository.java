package repository.jdbc;

import domain.order.DeliveryLocation;
import domain.catalog.DeliverySlot;
import repository.interfaces.DeliveryCatalogRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class JdbcDeliveryCatalogRepository implements DeliveryCatalogRepository {

    private final Set<DeliveryLocation> locations = new HashSet<>();
    private final Map<String, List<DeliverySlot>> slotsByRestaurant = new ConcurrentHashMap<>();

    @Override
    public void clear() {
        locations.clear();
        slotsByRestaurant.clear();
    }

    @Override
    public void addLocation(DeliveryLocation loc) {
        if (loc != null) {
            locations.add(loc);
        }
    }

    private boolean matchLocation(String loc1, String loc2) {
        if (loc1 == null || loc2 == null) return false;
        if (loc1.equals(loc2)) return true;
        String s1 = loc1.replaceAll("[^a-zA-Z A]", "");
        String s2 = loc2.replaceAll("[^a-zA-Z A]", "");
        return s1.equals(s2) && !s1.isEmpty();
    }

    @Override
    public boolean isValidLocation(String name) {
        return locations.stream().anyMatch(l -> matchLocation(l.getName(), name));
    }

    @Override
    public Optional<DeliveryLocation> findLocation(String name) {
        return locations.stream()
                .filter(l -> matchLocation(l.getName(), name))
                .findFirst();
    }

    @Override
    public Set<DeliveryLocation> allLocations() {
        return new HashSet<>(locations);
    }

    @Override
    public void setSlots(String restaurantId, List<DeliverySlot> slots) {
        slotsByRestaurant.put(restaurantId, new ArrayList<>(slots));
    }

    @Override
    public List<DeliverySlot> slotsFor(String restaurantId) {
        return slotsByRestaurant.getOrDefault(restaurantId, new ArrayList<>());
    }

    @Override
    public Optional<DeliverySlot> findSlot(String restaurantId, String label) {
        return slotsFor(restaurantId).stream()
                .filter(s -> s.getLabel().equals(label))
                .findFirst();
    }

    @Override
    public void updateSlotCapacities(String restaurantId, Map<String, Integer> capacitiesByLabel) {
    }

    @Override
    public DeliverySlot addSlot(String restaurantId, LocalDateTime start, int capacity) {
        DeliverySlot slot = new DeliverySlot(start, capacity);
        slotsByRestaurant.computeIfAbsent(restaurantId, k -> new ArrayList<>()).add(slot);
        return slot;
    }

    @Override
    public boolean deleteSlot(String restaurantId, String label) {
        List<DeliverySlot> slots = slotsByRestaurant.get(restaurantId);
        if (slots != null) {
            return slots.removeIf(s -> s.getLabel().equals(label));
        }
        return false;
    }

    @Override
    public boolean consumeCapacity(String restaurantId, String label) {
        return false;
    }
}

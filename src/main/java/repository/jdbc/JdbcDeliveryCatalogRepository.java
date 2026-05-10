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

public class JdbcDeliveryCatalogRepository implements DeliveryCatalogRepository {

    @Override
    public void clear() {
    }

    @Override
    public void addLocation(DeliveryLocation loc) {
    }

    @Override
    public boolean isValidLocation(String name) {
        return false;
    }

    @Override
    public Optional<DeliveryLocation> findLocation(String name) {
        return Optional.empty();
    }

    @Override
    public Set<DeliveryLocation> allLocations() {
        return new HashSet<>();
    }

    @Override
    public void setSlots(String restaurantId, List<DeliverySlot> slots) {
    }

    @Override
    public List<DeliverySlot> slotsFor(String restaurantId) {
        return new ArrayList<>();
    }

    @Override
    public Optional<DeliverySlot> findSlot(String restaurantId, String label) {
        return Optional.empty();
    }

    @Override
    public void updateSlotCapacities(String restaurantId, Map<String, Integer> capacitiesByLabel) {
    }

    @Override
    public DeliverySlot addSlot(String restaurantId, LocalDateTime start, int capacity) {
        return new DeliverySlot(start, capacity);
    }

    @Override
    public boolean deleteSlot(String restaurantId, String label) {
        return false;
    }

    @Override
    public boolean consumeCapacity(String restaurantId, String label) {
        return false;
    }
}

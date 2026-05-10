package repository.interfaces;
import domain.order.DeliveryLocation;
import domain.catalog.DeliverySlot;
import java.util.*;
import java.time.LocalDateTime;
public interface DeliveryCatalogRepository {
    void clear();
    void addLocation(DeliveryLocation loc);
    boolean isValidLocation(String name);
    Optional<DeliveryLocation> findLocation(String name);
    Set<DeliveryLocation> allLocations();
    void setSlots(String restaurantId, List<DeliverySlot> slots);
    List<DeliverySlot> slotsFor(String restaurantId);
    Optional<DeliverySlot> findSlot(String restaurantId, String label);
    void updateSlotCapacities(String restaurantId, Map<String, Integer> capacitiesByLabel);
    DeliverySlot addSlot(String restaurantId, LocalDateTime start, int capacity);
    boolean deleteSlot(String restaurantId, String label);
    boolean consumeCapacity(String restaurantId, String label);
}

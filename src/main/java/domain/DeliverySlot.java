package domain;

import java.time.LocalDateTime;

public class DeliverySlot {
    private LocalDateTime start;
    private int capacity;
    private int reserved;

    public DeliverySlot(LocalDateTime start, int capacity) {
        this.start = start;
        this.capacity = capacity;
        this.reserved = 0;
    }

    // Reserve one unit if available
    public boolean reserve(){
        if(reserved < capacity) {
            reserved++;
            return true;
        }
        return false;
    }

    // Reserve a given quantity if available
    public boolean reserve(int quantity){
        if (quantity <= 0) return true;
        if (canFit(quantity)) {
            reserved += quantity;
            return true;
        }
        return false;
    }

    // Release one unit if any reserved
    public void release(){
        if (reserved > 0) {
            reserved--;
        }
    }

    // Release a given quantity, clamped at zero
    public void release(int quantity){
        if (quantity <= 0) return;
        reserved = Math.max(0, reserved - quantity);
    }

    public LocalDateTime getStart() {
        return start;
    }

    public int getCapacity() { return capacity; }
    public int getReserved() { return reserved; }
    public int getRemainingCapacity() { return Math.max(0, capacity - reserved); }
    public boolean canFit(int quantity) { return quantity <= getRemainingCapacity(); }

    public String getLabel() {
        // Example: "12:00" becomes "12:00-12:30"
        var end = start.plusMinutes(30);
        return String.format("%02d:%02d-%02d:%02d",
                start.getHour(), start.getMinute(),
                end.getHour(), end.getMinute());
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }
    @Override
    public String toString() {
        return "DeliverySlot{" +
                "start=" + start +
                ", capacity=" + capacity +
                ", reserved=" + reserved +
                '}';
    }
}

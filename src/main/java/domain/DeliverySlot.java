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

    public boolean reserve(){
        if(reserved < capacity) {
            reserved++;
            return true;
        }
        return false;
    }

    public void release(){
        if (reserved > 0) {
            reserved--;
        }
    }

    public LocalDateTime getStart() {
        return start;
    }

    public String getLabel() {
        // exemplu: "12:00" devine "12:00-12:30"
        var end = start.plusMinutes(30);
        return String.format("%02d:%02d-%02d:%02d",
                start.getHour(), start.getMinute(),
                end.getHour(), end.getMinute());
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

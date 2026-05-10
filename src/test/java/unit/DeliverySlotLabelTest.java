package unit;

import domain.catalog.DeliverySlot;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class DeliverySlotLabelTest {

    @Test
    void label_hasDashAndTimeFormat() {
        var start = LocalDateTime.of(2025, 10, 21, 12, 0);
        DeliverySlot slot = new DeliverySlot(start, 10);
        String label = slot.getLabel();
        assertTrue(label.contains("-"));
        assertTrue(label.startsWith("12:00"));
        assertTrue(label.endsWith("12:30"));
    }
}


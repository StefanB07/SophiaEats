package unit;

import domain.DeliverySlot;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class DeliverySlotTest {

    @Test
    void canFit_exactCapacity_thenTrue() {
        DeliverySlot slot = new DeliverySlot(LocalDateTime.now().plusHours(1), 3);
        assertTrue(slot.canFit(3));
        assertFalse(slot.canFit(4));
    }

    @Test
    void reserveAndRelease_quantity() {
        DeliverySlot slot = new DeliverySlot(LocalDateTime.now().plusHours(1), 5);
        assertEquals(5, slot.getCapacity());
        assertEquals(0, slot.getReserved());
        assertTrue(slot.reserve(3));
        assertEquals(3, slot.getReserved());
        assertEquals(2, slot.getRemainingCapacity());

        // over reserve should fail and not change state
        assertFalse(slot.reserve(3));
        assertEquals(3, slot.getReserved());

        // release clamps at zero
        slot.release(2);
        assertEquals(1, slot.getReserved());
        slot.release(10);
        assertEquals(0, slot.getReserved());
    }

    @Test
    void singleUnitReserveRelease() {
        DeliverySlot slot = new DeliverySlot(LocalDateTime.now().plusHours(1), 1);
        assertTrue(slot.reserve());
        assertFalse(slot.reserve());
        assertEquals(1, slot.getReserved());
        slot.release();
        assertEquals(0, slot.getReserved());
    }
}


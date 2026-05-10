package unit;

import domain.order.Payment;
import domain.order.PaymentMethod;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaymentTest {

    @Test
    void constructor_and_basicSetters() {
        Payment p = new Payment(PaymentMethod.EXTERNAL, 12.5);
        assertEquals(PaymentMethod.EXTERNAL, p.getMethod());
        assertEquals(12.5, p.getAmount(), 0.0001);
        assertFalse(p.isSuccess());

        p.setSuccess(true);
        assertTrue(p.isSuccess());

        p.setProvider("MockPay");
        p.setRedirectUrl("https://mock.example/pay");
        assertEquals("MockPay", p.getProvider());
        assertEquals("https://mock.example/pay", p.getRedirectUrl());
    }
}


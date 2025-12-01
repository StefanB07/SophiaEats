package service;

import domain.Order;
import domain.Payment;
import domain.PaymentMethod;

public class DummyExternalPaymentProvider implements PaymentProvider {
    @Override
    public Payment payExternal(Order order) {
        double amount = order.getTotal();
        Payment p = new Payment(PaymentMethod.EXTERNAL, amount);
        p.setProvider("DUMMY");
        p.setSuccess(true);
        return p;
    }
}


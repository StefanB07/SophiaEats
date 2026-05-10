package service;

import domain.order.Order;
import domain.order.Payment;
import domain.order.PaymentMethod;

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



package service;

import domain.order.Order;
import domain.order.Payment;

public interface PaymentProvider {
    Payment payExternal(Order order);
}



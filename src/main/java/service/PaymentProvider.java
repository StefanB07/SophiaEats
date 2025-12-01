package service;

import domain.Order;
import domain.Payment;

public interface PaymentProvider {
    Payment payExternal(Order order);
}


package service;

public final class PaymentProviders {
    public static PaymentProvider defaultProvider() {
        return new DummyExternalPaymentProvider();
    }
}


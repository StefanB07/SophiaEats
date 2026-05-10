package domain.order;

public enum OrderStatus {
    CREATED,   // order created but not yet paid
    PAID,      // payment confirmed
    DELIVERED, // order delivered to the user
    CANCELLED
}


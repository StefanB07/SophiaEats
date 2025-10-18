package domain;

public enum OrderStatus {
    DRAFT,
    CREATED,   // order created but not yet paid
    PAID,      // payment confirmed
    DELIVERED, // order delivered to the user
    CANCELLED
}

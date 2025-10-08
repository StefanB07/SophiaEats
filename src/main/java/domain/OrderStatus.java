package domain;

public enum OrderStatus {
    DRAFT,
    CREATED, // created command but not processed
    PAID,    // paid
    CANCELLED
}

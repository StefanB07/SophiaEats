package domain;

public enum OrderStatus {
    CREATED, // comandă creată, neprocesată
    PAID,    // plătită (de adăugat ulterior)
    CANCELLED
}

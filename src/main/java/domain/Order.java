package domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Order {
    private final String id;
    private final LocalDateTime createdAt;
    private final List<OrderItem> items;
    private final String deliveryPlace;
    private final LocalDateTime deliveryTime;
    private final double total;
    private OrderStatus status;

    public Order(List<OrderItem> items, String deliveryPlace, LocalDateTime deliveryTime) {
        this.id = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.items = new ArrayList<>(items);
        this.deliveryPlace = deliveryPlace;
        this.deliveryTime = deliveryTime;
        this.total = items.stream().mapToDouble(OrderItem::getTotalPrice).sum();
        this.status = OrderStatus.CREATED;
    }

//    public Order(String userId,
//                 String restaurantId,
//                 List<OrderItem> items,
//                 LocalDateTime createdAt,
//                 DeliverySlot slot,
//                 DeliveryLocation location,
//                 OrderStatus status,
//                 Payment payment) {
//        this.userId = userId;
//        this.restaurantId = restaurantId;
//        this.items = items;
//        this.createdAt = createdAt;
//        this.slot = slot;
//        this.location = location;
//        this.status = status;
//        this.payment = payment;
//    }

    public String getId() { return id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return new ArrayList<>(items); }
    public String getDeliveryPlace() { return deliveryPlace; }
    public LocalDateTime getDeliveryTime() { return deliveryTime; }
    public double getTotal() { return total; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
}

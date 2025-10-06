package domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Order {

    private final String id;
    private CampusUser user;
    private Restaurant restaurant;
    private List<OrderItem> items;
    private DeliverySlot deliverySlot;
    private DeliveryLocation deliveryLocation;
    private Payment payment;
    private OrderStatus status;
    private LocalDateTime createdAt;

    public Order(CampusUser user, Restaurant restaurant) {
        this.id = UUID.randomUUID().toString();
        this.user = user;
        this.restaurant = restaurant;
        this.items = new ArrayList<>();
        this.status = OrderStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        items.add(item);
    }

    public double getTotalPrice() {
        return items.stream().mapToDouble(OrderItem::getTotalPrice).sum();
    }

    public void chooseDeliverySlot(DeliverySlot slot) {
        if (slot.reserve()) {
            this.deliverySlot = slot;
        } else {
            throw new IllegalStateException("Delivery slot is full");
        }
    }

    public void setDeliveryLocation(DeliveryLocation location) {
        this.deliveryLocation = location;
    }

    public void attachPayment(Payment payment) {
        this.payment = payment;
    }

    public void validate() {
        if (items.isEmpty()) throw new IllegalStateException("Cannot validate empty order");
        if (deliverySlot == null || deliveryLocation == null) throw new IllegalStateException("Missing delivery details");
        if (payment == null) throw new IllegalStateException("Payment not attached");

        this.status = OrderStatus.VALIDATED;
    }

    public void markPaid() {
        this.status = OrderStatus.PAID;
    }

    public void cancel() {
        this.status = OrderStatus.CANCELLED;
        if (deliverySlot != null) deliverySlot.release();
    }

    public String getId() {
        return id;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public CampusUser getUser() {
        return user;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id='" + id + '\'' +
                ", user=" + user.getName() +
                ", restaurant=" + restaurant.getName() +
                ", total=" + getTotalPrice() +
                ", status=" + status +
                '}';
    }
}

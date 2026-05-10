package repository.entities;
import java.time.LocalDateTime;
public class OrderEntity {
    private String id;
    private LocalDateTime createdAt;
    private String deliveryPlace;
    private LocalDateTime deliveryTime;
    private double total;
    private String status;
    public OrderEntity() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getDeliveryPlace() { return deliveryPlace; }
    public void setDeliveryPlace(String deliveryPlace) { this.deliveryPlace = deliveryPlace; }
    public LocalDateTime getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(LocalDateTime deliveryTime) { this.deliveryTime = deliveryTime; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
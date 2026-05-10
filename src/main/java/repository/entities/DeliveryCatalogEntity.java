package repository.entities;

public class DeliveryCatalogEntity {
    private String id;
    private String slotId;
    private int capacity;

    public DeliveryCatalogEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
}


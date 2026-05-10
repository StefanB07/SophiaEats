package repository.entities;

public class CartEntity {
    private String id;
    private String ownerUserId;

    public CartEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }
}


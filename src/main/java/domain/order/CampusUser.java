package domain.order;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CampusUser {
    private final String id;
    private String name;
    private String email;
    private String country;
    private StudentCredit studentCredit;

    // NEW: simple order history to record user's orders/payments
    private List<Order> orders;

    public CampusUser(String name, String email, String country) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.country = country;
        this.studentCredit = null; // se poate ataÈ™a ulterior
        this.orders = new ArrayList<>();
    }

    public String getId() {
        return id;
    }
    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getCountry() {
        return country;
    }

    // === Student Credit ===
    public void assignStudentCredit(StudentCredit credit) {
        this.studentCredit = credit;
    }

    public StudentCredit getStudentCredit() {
        return studentCredit;
    }

    public void setStudentCredit(StudentCredit studentCredit) {
        this.studentCredit = studentCredit;
    }

    // === Orders ===
    public void addOrder(Order order) {
        if (order != null) {
            orders.add(order);
        }
    }

    public List<Order> getOrders() {
        return new ArrayList<>(orders);
    }

    @Override
    public String toString() {
        return "CampusUser{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", studentCredit=" + studentCredit +
                '}';
    }

}


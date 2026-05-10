package domain.order;

import java.util.ArrayList;
import java.util.List;

public class CampusUser extends User {
    private String country;
    private StudentCredit studentCredit;
    private List<Order> orders;

    public CampusUser(String name, String email, String country) {
        super(name, email);
        this.country = country;
        this.studentCredit = null;
        this.orders = new ArrayList<>();
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
                "name='" + getName() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", studentCredit=" + studentCredit +
                '}';
    }
}


package unit;

import domain.catalog.*;`nimport domain.order.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CampusUserTest {

    @Test
    void assignCredit_andOrders() {
        CampusUser u = new CampusUser("Alice", "alice@campus", "Dorm");
        assertNull(u.getStudentCredit());
        u.assignStudentCredit(new StudentCredit(30.0));
        assertNotNull(u.getStudentCredit());
        assertEquals(30.0, u.getStudentCredit().getBudget(), 0.0001);

        Order o = new Order(
                List.of(new OrderItem(new Dish("Soup","",5.0, DishCategory.STARTER, ""), 1, "Restaurant A")),
                new DeliveryLocation("Library", "Near main entrance"),
                LocalDateTime.now().plusHours(1)
        );
        u.addOrder(o);
        assertEquals(1, u.getOrders().size());
        assertEquals(o, u.getOrders().get(0));
    }
}

package unit;

import domain.catalog.Dish;
import domain.catalog.DishCategory;
import domain.catalog.ExtraOption;
import domain.order.OrderItem;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OrderItemTest {

    @Test
    void totalPrice_includesExtrasPerQuantity() {
        Dish d = new Dish("Burger", "", 8.0, DishCategory.MAIN_COURSE, "");
        OrderItem item = new OrderItem(d, 2, "Restaurant A");
        item.addExtraOptions(new ExtraOption("Cheese", 1.5));
        item.addExtraOptions(new ExtraOption("Bacon", 2.0));
        // base: 2 * 8 = 16; extras: (1.5 + 2.0) * 2 = 7; total = 23
        assertEquals(23.0, item.getTotalPrice(), 0.0001);
    }

    @Test
    void toString_isNonNull() {
        Dish d = new Dish("Soup", "", 5.0, DishCategory.STARTER, "");
        OrderItem item = new OrderItem(d, 1, "Restaurant A");
        assertNotNull(item.toString());
    }
}

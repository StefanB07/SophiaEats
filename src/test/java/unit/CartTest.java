package unit;

import domain.*;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CartTest {

    @Test
    void calculateTotal_sumsItems() {
        Cart cart = new Cart();
        cart.addItem(new OrderItem(new Dish("A","", 3.0, DishCategory.STARTER, ""), 2)); // 6
        cart.addItem(new OrderItem(new Dish("B","", 2.5, DishCategory.DESSERT, ""), 3)); // 7.5
        assertEquals(13.5, cart.calculateTotal(), 0.0001);
    }

    @Test
    void clear_removesAllItems() {
        Cart cart = new Cart();
        cart.addItem(new OrderItem(new Dish("A","", 3.0, DishCategory.STARTER, ""), 1));
        assertFalse(cart.getItems().isEmpty());
        cart.clear();
        assertTrue(cart.getItems().isEmpty());
        assertEquals(0.0, cart.calculateTotal(), 0.0001);
    }
}


package unit;

import domain.catalog.*;`nimport domain.order.*;
import org.junit.jupiter.api.Test;
import repository.CartRepository;
import repository.RestaurantRepository;
import service.CartService;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class CartServiceTest {

    @Test
    void listenerCalledOnAddAndClear() {
        CartRepository cartRepo = new repository.InMemoryCartRepository();
        RestaurantRepository restRepo = new repository.InMemoryRestaurantRepository();
        restRepo.clear();
        Restaurant r = new Restaurant("R", "Italian", "$$");
        Dish d = new Dish("Pizza", "", 10.0, DishCategory.MAIN_COURSE, "");
        r.addDishToMenu(d);
        restRepo.save(r);

        CartService cartService = new CartService(cartRepo, restRepo);
        Cart cart = cartRepo.createCart();

        AtomicInteger addCalls = new AtomicInteger(0);
        AtomicBoolean cleared = new AtomicBoolean(false);

        cartService.addListener(new CartService.CartListener() {
            @Override
            public void onItemAdded(Cart c, Restaurant restaurant) {
                addCalls.incrementAndGet();
                assertSame(cart, c);
                assertSame(r, restaurant);
                assertEquals(1, c.getItems().size());
            }
            @Override
            public void onCleared(Cart c) {
                cleared.set(true);
                assertTrue(c.getItems().isEmpty());
            }
        });

        cartService.addItem(cart, r, d, 1);

        assertEquals(1, addCalls.get());
        assertEquals(1, cart.getItems().size());

        cartService.clear(cart);

        assertTrue(cleared.get());
        assertTrue(cart.getItems().isEmpty());
    }
}


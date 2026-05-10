package unit;

import domain.catalog.*;
import domain.order.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import repository.interfaces.DeliveryCatalogRepository;
import repository.interfaces.RestaurantRepository;

import service.OrderService;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OrderServiceTest {

    private RestaurantRepository restaurants;
    private DeliveryCatalogRepository delivery;
    private OrderService orderService;

    private Restaurant rest;
    private Dish pizza;

    @BeforeEach
    void setUp() {
        restaurants = new repository.InMemoryRestaurantRepository();
        delivery = new repository.InMemoryDeliveryCatalogRepository();
        orderService = new OrderService(delivery, restaurants);

        // clean default and start new
        restaurants.clear();
        rest = new Restaurant("Testoria", "Italian", "$$");
        pizza = new Dish("Pizza Margherita", "Classic", 10.0, DishCategory.MAIN_COURSE, "");
        rest.addDishToMenu(pizza);
        restaurants.save(rest);

        // One slot starting in 45 minutes with capacity 5
        var slotStart = LocalDateTime.now().plusMinutes(45).withSecond(0).withNano(0);
        delivery.setSlots(rest.getId(), List.of(new DeliverySlot(slotStart, 5)));
        delivery.addLocation(new DeliveryLocation("Library", "Front desk"));
    }

    @Test
    void placeOrder_reservesCapacity_andCreatesOrder() {
        Cart cart = new Cart();
        cart.addItem(new OrderItem(pizza, 3, rest.getName()));

        var slot = delivery.slotsFor(rest.getId()).get(0);
        int before = slot.getRemainingCapacity();

        DeliveryLocation location = delivery.findLocation("Library")
                .orElseThrow(() -> new IllegalArgumentException("Invalid delivery location: Library"));

        Order order = orderService.placeOrder(cart, location, slot.getStart());

        assertNotNull(order.getId());
        assertEquals(OrderStatus.CREATED, order.getStatus());
        assertEquals(1, order.getItems().size());
        assertEquals(3, order.getItems().get(0).getQuantity());
        assertTrue(order.getTotal() > 0);

        // capacity reserved
        assertEquals(before - 3, slot.getRemainingCapacity());
        // cart cleared
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void placeOrder_rejectsWhenCapacityExceeded() {
        Cart cart = new Cart();
        cart.addItem(new OrderItem(pizza, 10, rest.getName())); // exceeds capacity 5
        var slot = delivery.slotsFor(rest.getId()).get(0);

        DeliveryLocation location = delivery.findLocation("Library")
                .orElseThrow(() -> new IllegalArgumentException("Invalid delivery location: Library"));

        assertThrows(IllegalStateException.class, () ->
                orderService.placeOrder(cart, location, slot.getStart()));
    }

    @Test
    void pay_external_setsPaidStatus() {
        Cart cart = new Cart();
        cart.addItem(new OrderItem(pizza, 2, rest.getName()));
        var slot = delivery.slotsFor(rest.getId()).get(0);

        DeliveryLocation location = delivery.findLocation("Library")
                .orElseThrow(() -> new IllegalArgumentException("Invalid delivery location: Library"));

        Order order = orderService.placeOrder(cart, location, slot.getStart());

        Payment payment = orderService.pay(order, PaymentMethod.EXTERNAL, null);
        assertTrue(payment.isSuccess());
        assertEquals(PaymentMethod.EXTERNAL, payment.getMethod());
        assertEquals(OrderStatus.PAID, order.getStatus());
        assertNotNull(order.getPaidAt());
    }

    @Test
    void pay_studentCredit_deductsBudget_andFailsWhenInsufficient() {
        // First order: total = 3 * 10 = 30
        Cart cart = new Cart();
        cart.addItem(new OrderItem(pizza, 3, rest.getName()));
        var firstSlot = delivery.slotsFor(rest.getId()).get(0);

        DeliveryLocation location = delivery.findLocation("Library")
                .orElseThrow(() -> new IllegalArgumentException("Invalid delivery location: Library"));

        Order order = orderService.placeOrder(cart, location, firstSlot.getStart());

        CampusUser user = new CampusUser("Bob", "bob@campus", "Dorm");
        user.assignStudentCredit(new StudentCredit(50.0));

        Payment p1 = orderService.pay(order, PaymentMethod.STUDENT_CREDIT, user);
        assertTrue(p1.isSuccess());
        assertEquals(20.0, user.getStudentCredit().getBudget(), 0.0001);

        var secondSlotStart = firstSlot.getStart().plusMinutes(30);
        var secondSlot = new DeliverySlot(secondSlotStart, 10);
        // update slots to include both
        delivery.setSlots(rest.getId(), List.of(firstSlot, secondSlot));

        // Second order costs 30 again, but user has only 20 left -> should fail for INSUFFICIENT_CREDIT
        Cart cart2 = new Cart();
        cart2.addItem(new OrderItem(pizza, 3, rest.getName()));

        Order order2 = orderService.placeOrder(cart2, location, secondSlotStart);
        var ex = assertThrows(IllegalArgumentException.class, () ->
                orderService.pay(order2, PaymentMethod.STUDENT_CREDIT, user));
        assertEquals("INSUFFICIENT_CREDIT", ex.getMessage());
    }
}

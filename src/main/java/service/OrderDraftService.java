package service;

import domain.*;
import repository.CampusUserRepository;
import repository.DeliveryCatalogRepository;
import repository.OrderRepository;
import repository.RestaurantRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class OrderDraftService {
    private final RestaurantRepository restaurants;
    private final CampusUserRepository users;
    private final DeliveryCatalogRepository delivery;
    private final OrderRepository orders;

    public OrderDraftService(RestaurantRepository restaurants,
                             CampusUserRepository users,
                             DeliveryCatalogRepository delivery,
                             OrderRepository orders) {
        this.restaurants = restaurants;
        this.users = users;
        this.delivery = delivery;
        this.orders = orders;
    }

    /**
     * Creează o comandă DRAFT după ce validează:
     * - restaurantul există (și implicit: comanda va referi UN restaurant)
     * - locația de livrare este în lista pre-înregistrată
     * - slotul de livrare este disponibil pentru acel restaurant
     */
    public Order createDraft(String userName, String restaurantName,
                             String deliveryLocationName, String deliverySlotLabel) {

        CampusUser user = users.findAll().stream()
                .filter(u -> u.getName().equalsIgnoreCase(userName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown campus user"));

        Restaurant restaurant = restaurants.findByName(restaurantName)
                .orElseThrow(() -> new IllegalArgumentException("Unknown restaurant: " + restaurantName));

        // regula: locația trebuie să fie din lista pre-înregistrată
        DeliveryLocation location = delivery.findLocation(deliveryLocationName)
                .orElseThrow(() -> new IllegalArgumentException("Invalid delivery location: " + deliveryLocationName));

        // regula: slot disponibil pentru restaurant
        DeliverySlot slot = delivery.findSlot(restaurant.getId(), deliverySlotLabel)
                .orElseThrow(() -> new IllegalArgumentException("Delivery slot not available: " + deliverySlotLabel));

        // construim comanda DRAFT (fără item-uri încă)
        List<OrderItem> items = new ArrayList<>(); // or populate with actual items
        String deliveryPlace = location.getName(); // assuming location is a DeliveryLocation
        LocalDateTime deliveryTime = slot.getStart(); // assuming slot is a DeliverySlot

        Order draft = new Order(items, deliveryPlace, deliveryTime);

        orders.save(draft);
        return draft;
    }
}

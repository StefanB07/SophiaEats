package service;
import repository.interfaces.RestaurantRepository;
import repository.interfaces.OrderRepository;
import repository.interfaces.DeliveryCatalogRepository;
import repository.interfaces.CampusUserRepository;

import domain.catalog.*;
import domain.order.*;
import repository.interfaces.CampusUserRepository;
import repository.interfaces.DeliveryCatalogRepository;
import repository.interfaces.OrderRepository;
import repository.interfaces.RestaurantRepository;

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

    public Order createDraft(String userName, String restaurantName,
                             String deliveryLocationName, String deliverySlotLabel) {

        CampusUser user = users.findAll().stream()
                .filter(u -> u.getName().equalsIgnoreCase(userName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown campus user"));

        Restaurant restaurant = restaurants.findByName(restaurantName)
                .orElseThrow(() -> new IllegalArgumentException("Unknown restaurant: " + restaurantName));

        // the delivery location is in pre-registered locations
        DeliveryLocation location = delivery.findLocation(deliveryLocationName)
                .orElseThrow(() -> new IllegalArgumentException("Invalid delivery location: " + deliveryLocationName));

        // available slot for restaurant
        DeliverySlot slot = delivery.findSlot(restaurant.getId(), deliverySlotLabel)
                .orElseThrow(() -> new IllegalArgumentException("Delivery slot not available: " + deliverySlotLabel));

        // draft order without items for now
        List<OrderItem> items = new ArrayList<>(); // or populate with actual items
        LocalDateTime deliveryTime = slot.getStart(); // assuming slot is a DeliverySlot

        Order draft = new Order(items, location, deliveryTime);

        orders.save(draft);
        return draft;
    }
}


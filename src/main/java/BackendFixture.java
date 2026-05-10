import repository.*;
import repository.interfaces.*;
import service.OrderDraftService;
import bootstrap.DataSeeder; // added import

public class BackendFixture {
    public final RestaurantRepository restaurants = new repository.InMemoryRestaurantRepository();
    public final CampusUserRepository users = new repository.InMemoryCampusUserRepository();
    public final CartRepository carts = new repository.InMemoryCartRepository();
    public final OrderRepository orders = new repository.InMemoryOrderRepository();
    public final DeliveryCatalogRepository delivery = new repository.InMemoryDeliveryCatalogRepository();

    public final OrderDraftService orderDraftService =
            new OrderDraftService(restaurants, users, delivery, orders);

    public DataSeeder.Seed seed;

    public void reset() {
        seed = DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);
    }
}


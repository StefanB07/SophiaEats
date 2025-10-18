import repository.*;
import service.OrderDraftService;
import bootstrap.DataSeeder; // added import

public class BackendFixture {
    public final RestaurantRepository restaurants = new RestaurantRepository();
    public final CampusUserRepository users = new CampusUserRepository();
    public final CartRepository carts = new CartRepository();
    public final OrderRepository orders = new OrderRepository();
    public final DeliveryCatalogRepository delivery = new DeliveryCatalogRepository();

    public final OrderDraftService orderDraftService =
            new OrderDraftService(restaurants, users, delivery, orders);

    public DataSeeder.Seed seed;

    public void reset() {
        seed = DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);
    }
}
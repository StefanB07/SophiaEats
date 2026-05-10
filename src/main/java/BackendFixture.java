import repository.*;
import repository.interfaces.*;
import service.OrderDraftService;
import bootstrap.DataSeeder; // added import

public class BackendFixture {
    public final RestaurantRepository restaurants = new repository.jdbc.JdbcRestaurantRepository();
    public final CampusUserRepository users = new repository.jdbc.JdbcCampusUserRepository();
    public final CartRepository carts = new repository.jdbc.JdbcCartRepository();
    public final OrderRepository orders = new repository.jdbc.JdbcOrderRepository();
    public final DeliveryCatalogRepository delivery = new repository.jdbc.JdbcDeliveryCatalogRepository();

    public final OrderDraftService orderDraftService =
            new OrderDraftService(restaurants, users, delivery, orders);

    public DataSeeder.Seed seed;

    public void reset() {
        seed = DataSeeder.resetAndSeed(users, restaurants, carts, orders, delivery);
    }
}

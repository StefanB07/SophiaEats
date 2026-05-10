package repository.interfaces;
import domain.order.CampusUser;
import java.util.List;
import java.util.Optional;
public interface CampusUserRepository {
    List<CampusUser> findAll();
    void save(CampusUser user);
    void clear();
    Optional<CampusUser> findById(String id);
}

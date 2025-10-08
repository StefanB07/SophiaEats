package repository;

import domain.CampusUser;
import java.util.ArrayList;
import java.util.List;

public class CampusUserRepository {
    private final List<CampusUser> users = new ArrayList<>();

    public CampusUserRepository() {
        users.add(new CampusUser("Alice","alice.magic@upb.ro", "Tara Minunilor"));
    }
    public List<CampusUser> findAll() {
        return users;
    }
    public void save(CampusUser user) {
        users.add(user);
    }
    public void clear() {
        users.clear();
    }
}

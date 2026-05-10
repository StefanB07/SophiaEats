package repository.jdbc;

import domain.order.CampusUser;
import repository.interfaces.CampusUserRepository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.lang.reflect.Field;
import domain.order.StudentCredit;

public class JdbcCampusUserRepository implements CampusUserRepository {
    
    private void setPrivateId(CampusUser user, String id) {
        try {
            Field idField = CampusUser.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, id);
        } catch (Exception ignored) {}
    }

    @Override
    public List<CampusUser> findAll() {
        List<CampusUser> users = new ArrayList<>();
        String sql = "SELECT id, name, role, credit FROM users";
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                CampusUser user = new CampusUser(rs.getString("name"), "placeholder@email.com", "Default Location");
                setPrivateId(user, rs.getString("id"));
                user.assignStudentCredit(new StudentCredit(rs.getDouble("credit")));
                users.add(user);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

    @Override
    public void save(CampusUser user) {
        String sql = "INSERT INTO users (id, name, role, credit) VALUES (?, ?, ?, ?) " +
                     "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, credit = EXCLUDED.credit";
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getId());
            stmt.setString(2, user.getName());
            stmt.setString(3, "CUSTOMER");
            stmt.setDouble(4, user.getStudentCredit() != null ? user.getStudentCredit().getBudget() : 0.0);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void clear() {
        String sql = "DELETE FROM users";
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Optional<CampusUser> findById(String id) {
        String sql = "SELECT id, name, role, credit FROM users WHERE id = ?";
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    CampusUser user = new CampusUser(rs.getString("name"), "placeholder@email.com", "Default Location");
                    setPrivateId(user, rs.getString("id"));
                    user.assignStudentCredit(new StudentCredit(rs.getDouble("credit")));
                    return Optional.of(user);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }
}

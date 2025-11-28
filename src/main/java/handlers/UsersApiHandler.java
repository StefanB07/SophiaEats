package handlers;

import com.sun.net.httpserver.HttpExchange;
import domain.CampusUser;
import repository.CampusUserRepository;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class UsersApiHandler extends BaseHandler {

    private final CampusUserRepository users;

    public UsersApiHandler(CampusUserRepository users) {
        this.users = users;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        String rawPath = ex.getRequestURI().getPath();
        // Accept /users
        String path = rawPath.startsWith("/api/") ? rawPath.substring(4) : rawPath;

        try {
            if (method.equals("GET") && path.matches("^/users/?$")) {
                getAllUsers(ex);
                return;
            }
            sendError(ex, 404, "Not found");
        } catch (Exception e) {
            sendError(ex, 500, "Server error: " + e.getMessage());
        }
    }

    private void getAllUsers(HttpExchange ex) throws IOException {
        List<CampusUser> all = users.findAll();

        String json = all.stream()
                .map(u -> {
                    double credit = u.getStudentCredit() != null ? u.getStudentCredit().getBudget() : 0.0;
                    return "{" +
                            "\"id\":\"" + esc(u.getId()) + "\"," +
                            "\"name\":\"" + esc(u.getName()) + "\"," +
                            "\"email\":\"" + esc(u.getEmail()) + "\"," +
                            "\"studentCredit\":" + credit +
                            "}";
                })
                .collect(Collectors.joining(","));

        sendJson(ex, 200, "[" + json + "]");
    }
}

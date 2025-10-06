package handlers;

import com.sun.net.httpserver.HttpExchange;
import repository.CampusUserRepository;

import java.io.IOException;
import java.util.stream.Collectors;

public class CampusUserHandler extends BaseHandler {
    private final CampusUserRepository repo;
    public CampusUserHandler(CampusUserRepository repo) { this.repo = repo; }

    @Override public void handle(HttpExchange ex) throws IOException {
        if (!ex.getRequestMethod().equals("GET")) { sendText(ex,405,"Method Not Allowed"); return; }
//        var json = "[" + repo.findAll().stream()
//                .map(u -> "{\"id\":\""+esc(u.getId())+"\",\"name\":\""+esc(u.getName())+"\",\"credit\":"+u.getCredit()+"}")
//                .collect(Collectors.joining(",")) + "]";
        var json = "[" + repo.findAll().stream()
                .map(u -> "{\"emil\":\""+esc(u.getEmail())+"\",\"name\":\""+esc(u.getName())+"\"}")
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }
}

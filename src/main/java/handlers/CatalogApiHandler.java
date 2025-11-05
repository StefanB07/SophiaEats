package handlers;

import com.sun.net.httpserver.HttpExchange;
import domain.FilterCriteria;
import service.CatalogService;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.stream.Collectors;

public class CatalogApiHandler extends BaseHandler {
    private final CatalogService catalog;

    public CatalogApiHandler(CatalogService catalog) {
        this.catalog = catalog;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        String path = ex.getRequestURI().getPath();

        try {
            if (!"GET".equals(method)) { sendText(ex, 405, "Method Not Allowed"); return; }

            // /restaurants
            if (path.matches("^/restaurants/?$")) { listAll(ex); return; }
            // /restaurants/filter
            if (path.matches("^/restaurants/filter/?$")) { filter(ex); return; }
            // /restaurants/{name}
            if (path.startsWith("/restaurants/")) { one(ex, path.substring("/restaurants/".length())); return; }

            sendText(ex, 404, "Not found");
        } catch (Exception e) {
            sendText(ex, 500, "Server error: " + e.getMessage());
        }
    }

    private void listAll(HttpExchange ex) throws IOException {
        var json = "[" + catalog.listAll().stream()
                .map(r -> "{\"name\":\""+esc(r.getName())+"\",\"cuisineType\":\""+esc(r.getCuisineType())+"\",\"priceRange\":\""+esc(r.getPriceRange())+"\"}")
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private void one(HttpExchange ex, String nameEncoded) throws IOException {
        var name = nameEncoded.replace("%20"," ");
        var opt = catalog.findByName(name);
        if (opt.isEmpty()) { sendText(ex, 404, "Restaurant not found"); return; }
        var r = opt.get();
        var menu = r.getMenu().stream()
                .map(d -> "{\"name\":\""+esc(d.getName())+"\",\"price\":"+d.getPrice()+"}")
                .collect(Collectors.joining(","));
        var json = "{\"name\":\""+esc(r.getName())+"\",\"cuisineType\":\""+esc(r.getCuisineType())+"\",\"priceRange\":\""+esc(r.getPriceRange())+"\",\"menu\":["+menu+"]}";
        sendJson(ex, 200, json);
    }

    private void filter(HttpExchange ex) throws IOException {
        URI uri = ex.getRequestURI();
        Map<String, String> params = queryToMap(uri.getQuery());
        FilterCriteria c = new FilterCriteria();
        if (params.containsKey("cuisine")) c.setCuisineType(params.get("cuisine"));
        if (params.containsKey("dietary")) c.setDietaryTag(params.get("dietary"));
        if (params.containsKey("price")) c.setPriceRange(params.get("price"));
        if (params.containsKey("type")) c.setEstablishmentType(params.get("type"));
        if (params.containsKey("available")) c.setOnlyAvailable(Boolean.parseBoolean(params.get("available")));
        var list = catalog.filter(c);
        var json = "[" + list.stream()
                .map(r -> "{\"name\":\""+esc(r.getName())+"\",\"cuisineType\":\""+esc(r.getCuisineType())+"\",\"priceRange\":\""+esc(r.getPriceRange())+"\"}")
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private Map<String, String> queryToMap(String query) {
        return query == null ? Map.of() :
                java.util.Arrays.stream(query.split("&"))
                        .map(s -> s.split("=", 2))
                        .filter(a -> a.length == 2)
                        .collect(Collectors.toMap(a -> a[0], a -> a[1]));
    }
}


package handlers;

import com.sun.net.httpserver.HttpExchange;
import domain.FilterCriteria;
import service.CatalogService;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
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
            if (!"GET".equalsIgnoreCase(method)) {
                sendError(ex, 405, "Method Not Allowed");
                return;
            }

            // /restaurants
            if (path.matches("^/restaurants/?$")) {
                listAll(ex);
                return;
            }
            // /restaurants/filter
            if (path.matches("^/restaurants/filter/?$")) {
                filter(ex);
                return;
            }
            // /restaurants/{name}
            if (path.startsWith("/restaurants/")) {
                one(ex, path.substring("/restaurants/".length()));
                return;
            }

            sendError(ex, 404, "Not found");
        } catch (Exception e) {
            sendError(ex, 500, "Server error: " + e.getMessage());
        }
    }

    private void listAll(HttpExchange ex) throws IOException {
        var json = "[" + catalog.listAll().stream()
                .map(r -> "{"
                        + "\"name\":"        + qs(r.getName())        + ","
                        + "\"cuisineType\":" + qs(r.getCuisineType()) + ","
                        + "\"priceRange\":"  + qs(r.getPriceRange())
                        + "}")
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private void one(HttpExchange ex, String nameEncoded) throws IOException {
        var name = urlDecode(nameEncoded);
        var opt = catalog.findByName(name);
        if (opt.isEmpty()) { sendError(ex, 404, "Restaurant not found"); return; }

        var r = opt.get();
        var menu = r.getMenu().stream()
                .map(d -> "{"
                        + "\"name\":"  + qs(d.getName()) + ","
                        + "\"price\":" + d.getPrice()
                        + "}")
                .collect(Collectors.joining(","));

        var json = "{"
                + "\"name\":"        + qs(r.getName())        + ","
                + "\"cuisineType\":" + qs(r.getCuisineType()) + ","
                + "\"priceRange\":"  + qs(r.getPriceRange())  + ","
                + "\"menu\":[" + menu + "]"
                + "}";

        sendJson(ex, 200, json);
    }

    private void filter(HttpExchange ex) throws IOException {
        URI uri = ex.getRequestURI();
        Map<String, String> params = queryToMap(uri.getRawQuery()); // luăm raw și decodăm valorile punctual

        FilterCriteria c = new FilterCriteria();
        if (params.containsKey("cuisine"))   c.setCuisineType(urlDecode(params.get("cuisine")));
        if (params.containsKey("dietary"))   c.setDietaryTag(urlDecode(params.get("dietary")));
        if (params.containsKey("price"))     c.setPriceRange(urlDecode(params.get("price")));
        if (params.containsKey("type"))      c.setEstablishmentType(urlDecode(params.get("type")));
        if (params.containsKey("available")) c.setOnlyAvailable(Boolean.parseBoolean(urlDecode(params.get("available"))));

        var list = catalog.filter(c);
        var json = "[" + list.stream()
                .map(r -> "{"
                        + "\"name\":"        + qs(r.getName())        + ","
                        + "\"cuisineType\":" + qs(r.getCuisineType()) + ","
                        + "\"priceRange\":"  + qs(r.getPriceRange())
                        + "}")
                .collect(Collectors.joining(",")) + "]";
        sendJson(ex, 200, json);
    }

    private Map<String, String> queryToMap(String query) {
        return (query == null || query.isBlank()) ? Map.of() :
                java.util.Arrays.stream(query.split("&"))
                        .map(s -> s.split("=", 2))
                        .filter(a -> a.length == 2)
                        .collect(Collectors.toMap(a -> a[0], a -> a[1]));
    }

    // ---------- helpers ----------

    /** Decode UTF-8 the name from the URL path (accepts spaces, diacritics etc.) */
    private static String urlDecode(String s) {
        if (s == null) return null;
        return URLDecoder.decode(s, StandardCharsets.UTF_8);
    }

    /** Safe quote + escape for JSON strings.
     * Return with quotes. */
    private static String qs(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder(s.length() + 16);
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '\\': sb.append("\\\\"); break;
                case '\"': sb.append("\\\""); break;
                case '\b': sb.append("\\b");  break;
                case '\f': sb.append("\\f");  break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                default:
                    // escape pentru control chars < 0x20
                    if (ch < 0x20) {
                        sb.append(String.format("\\u%04x", (int) ch));
                    } else {
                        sb.append(ch);
                    }
            }
        }
        sb.append('"');
        return sb.toString();
    }
}

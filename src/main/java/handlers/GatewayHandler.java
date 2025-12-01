package handlers;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class GatewayHandler extends BaseHandler {
    private static final String CATALOG_BASE = "http://localhost:8081";
    private static final String ORDER_BASE   = "http://localhost:8082";

    private final HttpClient client = HttpClient.newHttpClient();

    @Override
    public void handle(HttpExchange ex) throws IOException {
        addCorsHeaders(ex);

        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            ex.close();
            return;
        }

        String path = ex.getRequestURI().getRawPath();
        String base;
        if (path.startsWith("/restaurants") || path.startsWith("/delivery")) {
            base = CATALOG_BASE;
        } else if (path.startsWith("/cart") || path.startsWith("/orders") || path.startsWith("/users")) {
            base = ORDER_BASE;
        } else {
            sendError(ex, 404, "Unknown path");
            return;
        }

        String query = ex.getRequestURI().getRawQuery();
        String targetUrl = base + path + (query != null ? "?" + query : "");
        String method = ex.getRequestMethod();

        boolean hasBody = method.equals("POST") || method.equals("PUT") || method.equals("PATCH") || method.equals("DELETE");
        byte[] body = hasBody ? ex.getRequestBody().readAllBytes() : new byte[0];

        HttpRequest.Builder b = HttpRequest.newBuilder()
                .uri(URI.create(targetUrl))
                .method(method, hasBody
                        ? HttpRequest.BodyPublishers.ofByteArray(body)
                        : HttpRequest.BodyPublishers.noBody());

        // Forward essential headers + Accept for JSON usage
        copyHeader(ex, b, "Content-Type");
        copyHeader(ex, b, "Authorization");
        copyHeader(ex, b, "X-User-Id");
        copyHeader(ex, b, "Accept");

        try {
            HttpResponse<byte[]> resp = client.send(b.build(), HttpResponse.BodyHandlers.ofByteArray());

            String ct = resp.headers().firstValue("Content-Type").orElse("application/json");
            ex.getResponseHeaders().set("Content-Type", ct);

            byte[] respBody = resp.body() == null ? new byte[0] : resp.body();
            ex.sendResponseHeaders(resp.statusCode(), respBody.length);
            try (OutputStream os = ex.getResponseBody()) {
                if (respBody.length > 0) os.write(respBody);
            }
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            sendError(ex, 502, "Interrupted");
        } catch (Exception e) {
            sendError(ex, 502, "Upstream error: " + e.getMessage());
        }
    }

    private static void copyHeader(HttpExchange ex, HttpRequest.Builder b, String name) {
        var vals = ex.getRequestHeaders().get(name);
        if (vals != null) for (String v : vals) b.header(name, v);
    }

    private static void addCorsHeaders(HttpExchange ex) {
        var h = ex.getResponseHeaders();
        h.set("Access-Control-Allow-Origin", "*");
        h.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id, Accept");
        h.set("Access-Control-Max-Age", "3600");
    }
}

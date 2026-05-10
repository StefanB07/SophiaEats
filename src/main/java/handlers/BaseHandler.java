package handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

public abstract class BaseHandler implements HttpHandler {
    protected void sendJson(HttpExchange ex, int status, String json) throws IOException {
        ex.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    protected void sendText(HttpExchange ex, int status, String text) throws IOException {
        ex.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    // Build a simple {"error":..., "status":...} JSON response
    protected void sendError(HttpExchange ex, int status, String message) throws IOException {
        String json = "{" +
                "\"error\":\"" + esc(message) + "\"," +
                "\"status\":" + status +
                "}";
        sendJson(ex, status, json);
    }

    protected String body(HttpExchange ex) throws IOException {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(ex.getRequestBody(), StandardCharsets.UTF_8))) {
            return br.lines().collect(Collectors.joining("\n"));
        }
    }

    protected static String esc(String s) {
        return s.replace("\"", "\\\"");
    }
}


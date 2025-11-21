package unit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import support.TestServer;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.junit.jupiter.api.Assertions.*;

class OrderApiHandlerIntegrationTest {

    private HttpClient client;

    @BeforeEach
    void startServer() throws Exception {
        TestServer.start();
        client = HttpClient.newHttpClient();
    }

    @AfterEach
    void stopServer() {
        TestServer.stop();
    }

    @Test
    void perUserCartFlowClearsAfterOrder() throws Exception {
        HttpRequest getWithoutHeader = HttpRequest.newBuilder(TestServer.uri("/cart"))
                .GET()
                .build();
        HttpResponse<String> missingHeaderResponse = client.send(getWithoutHeader, HttpResponse.BodyHandlers.ofString());
        assertEquals(400, missingHeaderResponse.statusCode());

        String addBody = """
                {
                  "restaurant": "Restaurant A",
                  "dish": "Pizza Margherita",
                  "qty": 2
                }
                """;

        HttpRequest addUser1 = HttpRequest.newBuilder(TestServer.uri("/cart/items"))
                .header("X-User-Id", "user-1")
                .header("Content-Type", "application/json")
                .POST(BodyPublishers.ofString(addBody))
                .build();
        HttpResponse<String> addResponse = client.send(addUser1, HttpResponse.BodyHandlers.ofString());
        assertEquals(201, addResponse.statusCode());

        double user1Total = cartTotal("user-1");
        assertTrue(user1Total > 0, "Expected user-1 cart total to be > 0");

        double user2Total = cartTotal("user-2");
        assertEquals(0.0, user2Total, 0.0001, "Expected user-2 cart to remain empty");

        LocalDateTime delivery = LocalDateTime.now().plusMinutes(30).withSecond(0).withNano(0);
        String orderBody = "Bât A|" + delivery.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        HttpRequest orderRequest = HttpRequest.newBuilder(TestServer.uri("/orders"))
                .header("X-User-Id", "user-1")
                .header("Content-Type", "text/plain")
                .POST(BodyPublishers.ofString(orderBody))
                .build();
        HttpResponse<String> orderResponse = client.send(orderRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(201, orderResponse.statusCode(), () -> "Order creation failed: " + orderResponse.body());

        double user1AfterOrder = cartTotal("user-1");
        assertEquals(0.0, user1AfterOrder, 0.0001, "Expected cart to be cleared after order");
    }

    private double cartTotal(String userId) throws Exception {
        HttpRequest getCart = HttpRequest.newBuilder(TestServer.uri("/cart"))
                .header("X-User-Id", userId)
                .GET()
                .build();
        HttpResponse<String> response = client.send(getCart, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, response.statusCode(), () -> "Unexpected status for " + userId + ": " + response.body());
        return extractTotal(response.body());
    }

    private static double extractTotal(String json) {
        int idx = json.indexOf("\"total\":");
        assertTrue(idx >= 0, "Total field not found in: " + json);
        int start = idx + "\"total\":".length();
        int end = start;
        while (end < json.length() && "0123456789.-".indexOf(json.charAt(end)) >= 0) {
            end++;
        }
        return Double.parseDouble(json.substring(start, end));
    }
}


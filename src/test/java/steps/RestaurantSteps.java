package steps;

import io.cucumber.java.AfterAll;
import io.cucumber.java.BeforeAll;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import support.TestServer;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

public class RestaurantSteps {
    private static HttpClient client;
    private HttpResponse<String> response;

    @BeforeAll
    public static void startServer() throws IOException {
        TestServer.start();
        client = HttpClient.newHttpClient();
    }

    @AfterAll
    public static void stopServer() {
        TestServer.stop();
    }

    @Given("the backend is running")
    public void the_backend_is_running() {
        assertTrue(TestServer.port() > 0, "Server is not running");
    }

    @When("I GET {string}")
    public void i_get(String path) throws Exception {
        var req = HttpRequest.newBuilder(TestServer.uri(path)).GET().build();
        response = client.send(req, HttpResponse.BodyHandlers.ofString());
    }

    @Then("the status is {int}")
    public void the_status_is(Integer expected) {
        assertEquals(expected.intValue(), response.statusCode());
    }

    @Then("the body contains {string}")
    public void the_body_contains(String needle) {
        assertNotNull(response);
        assertTrue(response.body().contains(needle), "Body did not contain: " + needle + "\n" + response.body());
    }
}

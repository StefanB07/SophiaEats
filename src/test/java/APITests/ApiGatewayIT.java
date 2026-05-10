package APITests;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

class ApiGatewayIT {

    @BeforeAll
    static void setup() {
        // Gateway URL
        RestAssured.baseURI = "http://localhost:8080";
    }

    @Test
    void shouldListRestaurantsThroughGateway() {
        given()
                .when()
                .get("/restaurants")
                .then()
                .statusCode(200);
    }

    @Test
    void shouldListUsersThroughGateway() {
        given()
                .when()
                .get("/users")
                .then()
                .statusCode(200);
    }

    @Test
    void shouldGetCartThroughGateway() {
        given()
                .header("X-User-Id", "alice")
                .when()
                .get("/cart")
                .then()
                .statusCode(200);
    }

    @Test
    void shouldGetCartDeliveryOptionsThroughGateway() {
        given()
                .header("X-User-Id", "alice")
                .when()
                .get("/cart/delivery-options")
                .then()
                .statusCode(200);
    }

    @Test
    void shouldReturn404ForUnknownPath() {
        given()
                .when()
                .get("/does-not-exist")
                .then()
                .statusCode(404);
    }
}

package APITests;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;


public class ExternalPaymentIT {

    @BeforeAll
    static void setupRestAssured() {
        RestAssured.baseURI = "http://localhost:8080";
    }

    @Test
    void externalPayment_createsPaidOrder() {
        given()
                .header("X-User-Id", "alice")
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "restaurant": "Restaurant A",
                          "dish": "Pizza Margherita",
                          "qty": 1
                        }
                        """)
        .when()
                .post("/cart/items")
        .then()
                .statusCode(anyOf(is(200), is(201)));

        String deliveryTime = "2025-11-28 21:00";

        given()
                .header("X-User-Id", "alice")
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "deliveryPlace": "Cafeteria",
                          "deliveryTime": "%s",
                          "paymentMethod": "EXTERNAL"
                        }
                        """.formatted(deliveryTime))
        .when()
                .post("/orders")
        .then()
                .statusCode(201)
                .body("status", equalTo("PAID"))
                .body("payment.method", equalTo("EXTERNAL"))
                .body("payment.success", equalTo(true));
    }
}

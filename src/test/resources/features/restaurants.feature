Feature: Restaurants minimal

  Scenario: List restaurants
    Given the backend is running
    When I GET "/restaurants"
    Then the status is 200
    And the body contains "La Fabrica"

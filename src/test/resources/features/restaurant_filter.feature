Feature: Restaurant filtering (backend-only)

  Background:
    Given a fresh restaurant repository

  Scenario: Filter by cuisine
    When I filter by cuisine "Italian"
    Then I get 1 restaurants
    And the result includes "La Fabrica"

  Scenario: Filter by dietary tag
    And in "La Fabrica" dish "Pizza Margherita" has dietary tag "gluten-free"
    When I filter by dietary "gluten-free"
    Then the result includes "La Fabrica"
    And the result does not include "Sushi World"

  Scenario: Filter only available excludes closed restaurants
    And restaurant "La Fabrica" is open false
    When I filter only available
    Then the result does not include "La Fabrica"


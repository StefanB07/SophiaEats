Feature: Order flow (backend-only)

  Background:
    Given a fresh backend context

  Scenario: Create order with valid restaurant and location
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 1 dish from the restaurant to the cart
    When I place an order to location "Bât A" for the next available slot
    Then the order is created with status "CREATED"
    And the order has delivery location "Bât A"

  Scenario: Invalid delivery location
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 1 dish from the restaurant to the cart
    When I try to place an order to location "Nowhere"
    Then the order is rejected with an error

  Scenario: Mixed restaurants in cart rejected
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 1 dish from the restaurant to the cart
    And I choose restaurant "Second Place"
    And I add 1 dish from the restaurant to the cart
    When I place an order to location "Bât A" for the next available slot
    Then the order is rejected with an error

  Scenario: Past delivery time is rejected
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 1 dish from the restaurant to the cart
    When I try to place an order to location "Bât A" at a past time
    Then the order is rejected with an error

  Scenario: Payment flow success
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 1 dish from the restaurant to the cart
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with EXTERNAL method
    Then the order is in status "PAID"
    When I mark the order delivered
    Then the order is in status "DELIVERED"

  Scenario: Deliver before payment is rejected
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 1 dish from the restaurant to the cart
    When I place an order to location "Bât A" for the next available slot
    And I try to mark the order delivered
    Then the order is rejected with an error
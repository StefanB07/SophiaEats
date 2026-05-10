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

  # --- Minimal slot-fit checks ---
  Scenario: Slot accepts current cart
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 2 dish from the restaurant to the cart
    And I capture the first delivery slot
    And I cap the first delivery slot capacity to 5
    Then the selected slot can accept the current cart

  Scenario: Slot rejects current cart
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 6 dish from the restaurant to the cart
    And I capture the first delivery slot
    And I cap the first delivery slot capacity to 5
    Then the selected slot cannot accept the current cart

  Scenario: Subsequent order allowed within remaining capacity
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I cap the first delivery slot capacity to 5
    And I add 3 dish from the restaurant to the cart
    When I place an order to location "Bât A" for the next available slot
    Then the order is created with status "CREATED"
    And my cart is empty
    And I add 2 dish from the restaurant to the cart
    When I place an order to location "Bât A" for the next available slot
    Then the order is created with status "CREATED"

  Scenario: Subsequent order blocked when capacity exceeded
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I cap the first delivery slot capacity to 5
    And I add 5 dish from the restaurant to the cart
    When I place an order to location "Bât A" for the next available slot
    Then the order is created with status "CREATED"
    And my cart is empty
    And I add 1 dish from the restaurant to the cart
    When I place an order to location "Bât A" for the next available slot
    Then the order is rejected with an error "DELIVERY_SLOT_CAPACITY_EXCEEDED"

  Scenario: Slot list recalculation after adding item
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I cap the first delivery slot capacity to 5
    And I add 1 dish from the restaurant to the cart
    When I query available slots
    Then the slot list should contain the first slot
    When I add 5 more dish from the restaurant to the cart
    And I query available slots
    Then the slot list should NOT contain the first slot

  Scenario: Slot list remains when cart is within capacity
    Given I am a Campus User
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I cap the first delivery slot capacity to 5
    And I add 2 dish from the restaurant to the cart
    When I query available slots
    Then the slot list should contain the first slot
    When I add 2 more dish from the restaurant to the cart
    And I query available slots
    Then the slot list should contain the first slot

  Scenario: Valid order validation
    Given I am a Campus User
    And I have items in cart
    And I choose restaurant "Restaurant A"
    When I select the first available slot and create order
    Then system marks order as CREATED and allows payment.

  Scenario: Invalid order validation
    Given I am a Campus User
    And I have items in cart
    And I choose restaurant "Restaurant A"
    And slot chosen is no longer available
    When I try to create an order
    Then system rejects creation and asks to choose another slot

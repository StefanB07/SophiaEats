Feature: Order payment with EXTERNAL method

  Background:
    Given a fresh backend context
    And I have an empty cart
    And I choose restaurant "Restaurant A"

  # External payment succeeds directly
  Scenario: Pay successfully with EXTERNAL method
    And I add 2 dish "Pasta" at price 20.00
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with EXTERNAL method
    Then the order is in status "PAID"

  # Insufficient student credit -> pay externally (fallback)
  Scenario: Fallback to EXTERNAL after student credit denial
    And I am a Campus User "u1" with STUDENT_CREDIT 10.00
    And I add 1 dish "Pasta" at price 20.00
    When I place an order to location "Bât A" for the next available slot
    And I try to pay the order with STUDENT_CREDIT method
    Then the order is rejected with an error "INSUFFICIENT_CREDIT"
    When I pay the order with EXTERNAL method
    Then the order is in status "PAID"

  # Small order paid externally (does not depend on student credit)
  Scenario: Small order paid externally
    And I add 1 dish "Pasta" at price 20.00
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with EXTERNAL method
    Then the order is in status "PAID"
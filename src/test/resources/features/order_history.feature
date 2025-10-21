Feature: Order history after payment

  Background:
    Given a fresh backend context
    And I am a Campus User "u1" with STUDENT_CREDIT 50.00
    And I have an empty cart
    And I choose restaurant "Restaurant A"

  Scenario: Paid order appears in user history
    And I add 2 dish "Pasta" at price 20.00
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with STUDENT_CREDIT method
    Then the order is in status "PAID"
    When I list my orders
    Then I see my last order with status "PAID" and total 40.00

  Scenario: Restaurant sees only "Paid"
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 1 dish "Pasta" at price 20.00
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with STUDENT_CREDIT method
    Then the order is in status "PAID"
    When the restaurant lists its orders
    Then it sees the order in status "PAID"
    And the payment method details are not visible


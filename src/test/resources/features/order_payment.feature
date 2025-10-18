Feature: Order payment and STUDENT_CREDIT handling

  Background:
    Given a fresh backend context
    And I am a Campus User "u1" with STUDENT_CREDIT 50.00
    And I have an empty cart
    And I choose restaurant "Restaurant A"

  Scenario: Pay with campus STUDENT_CREDIT
    And I add 2 dish "Pasta" at price 20.00
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with STUDENT_CREDIT method
    Then the order is in status "PAID"
    And the user "u1" STUDENT_CREDIT becomes 10.00

  Scenario: Insufficient campus STUDENT_CREDIT
    And I am a Campus User "u2" with STUDENT_CREDIT 5.00
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add 1 dish "Pasta" at price 12.00
    When I place an order to location "Bât A" for the next available slot
    And I try to pay the order with STUDENT_CREDIT method
    Then the order is rejected with an error "INSUFFICIENT_CREDIT"

  Scenario: Total uses current prices
    And I add 1 dish "Pasta" at price 10.00
    And the current price of "Pasta" becomes 12.00
    When I place an order to location "Bât A" for the next available slot
    Then the order total is 12.00

  Scenario: Cart is emptied after placing order
    And I add 1 dish "Pasta" at price 12.00
    When I place an order to location "Bât A" for the next available slot
    Then my cart is empty

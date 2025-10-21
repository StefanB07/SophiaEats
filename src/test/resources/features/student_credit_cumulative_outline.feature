Feature: Student credit cumulative usage with multiple orders in one scenario

  Background:
    Given a fresh backend context
    And I choose restaurant "Restaurant A"

  #
  # Both orders succeed using Student Credit
  #
  Scenario Outline: Two paid orders with Student Credit — second succeeds
    And I am a Campus User "u1" with STUDENT_CREDIT <init_credit>
    And I have an empty cart
    And I add <q1> dish "<dish1>" at price <p1>
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with STUDENT_CREDIT method
    Then the order is in status "PAID"
    And the user "u1" STUDENT_CREDIT becomes <after_first>

    # the second order in the same scenario
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add <q2> dish "<dish2>" at price <p2>
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with STUDENT_CREDIT method
    Then the order is in status "PAID"
    And the user "u1" STUDENT_CREDIT becomes <after_second>

    # NOTE: prices must match DataSeeder menu exactly
    Examples:
      | init_credit | q1 | dish1             | p1    | after_first | q2 | dish2        | p2   | after_second |
      | 50.00       | 1  | Pasta             | 20.00 | 30.00       | 2  | Bruschetta   | 6.00 | 18.00        |
      | 40.00       | 2  | Lasagna           | 12.00 | 16.00       | 1  | Pizza Margherita | 8.50 | 7.50     |

  #
  # The second order fails due to insufficient funds
  #
  Scenario Outline: Two orders with Student Credit — second fails (insufficient)
    And I am a Campus User "u1" with STUDENT_CREDIT <init_credit>
    And I have an empty cart
    And I add <q1> dish "<dish1>" at price <p1>
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with STUDENT_CREDIT method
    Then the order is in status "PAID"
    And the user "u1" STUDENT_CREDIT becomes <after_first>

    # second order in the same scenario: insufficient funds
    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add <q2> dish "<dish2>" at price <p2>
    When I place an order to location "Bât A" for the next available slot
    And I try to pay the order with STUDENT_CREDIT method
    Then the order is rejected with an error "INSUFFICIENT_CREDIT"
    And the user "u1" STUDENT_CREDIT becomes <after_first>

    Examples:
      | init_credit | q1 | dish1 | p1    | after_first | q2 | dish2   | p2    |
      | 30.00       | 1  | Pasta | 20.00 | 10.00       | 1  | Lasagna | 12.00 |
      | 25.00       | 2  | Pizza Margherita | 8.50 | 8.00 | 2 | Tiramisu | 6.50 |

  #
  # The second order first tries STUDENT_CREDIT (fails), then EXTERNAL (succeeds)
  #
  Scenario Outline: Second order falls back to EXTERNAL after credit denial
    And I am a Campus User "u1" with STUDENT_CREDIT <init_credit>
    And I have an empty cart
    And I add <q1> dish "<dish1>" at price <p1>
    When I place an order to location "Bât A" for the next available slot
    And I pay the order with STUDENT_CREDIT method
    Then the order is in status "PAID"
    And the user "u1" STUDENT_CREDIT becomes <after_first>

    And I have an empty cart
    And I choose restaurant "Restaurant A"
    And I add <q2> dish "<dish2>" at price <p2>
    When I place an order to location "Bât A" for the next available slot
    And I try to pay the order with STUDENT_CREDIT method
    Then the order is rejected with an error "INSUFFICIENT_CREDIT"
    And the user "u1" STUDENT_CREDIT becomes <after_first>
    When I pay the order with EXTERNAL method
    Then the order is in status "PAID"
    And the user "u1" STUDENT_CREDIT becomes <after_first>

    Examples:
      | init_credit | q1 | dish1 | p1    | after_first | q2 | dish2   | p2    |
      | 30.00       | 1  | Pasta | 20.00 | 10.00       | 1  | Lasagna | 12.00 |
      | 25.00       | 2  | Pizza Margherita | 8.50 | 8.00 | 2 | Tiramisu | 6.50 |

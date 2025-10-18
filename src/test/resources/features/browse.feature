Feature: Browse dishes (backend-only)

  Background:
    Given a fresh backend context

  Scenario: Browse dishes without login
    Given I am not logged in
    When I access SophiaTech Eats
    Then I can list restaurants and dishes
    And I cannot place an order without selecting items

  Scenario: Browse dishes as Campus User
    Given I am logged in
    When I browse restaurant menus
    Then I see dishes with names and prices
    And at least one dish has dietary tags


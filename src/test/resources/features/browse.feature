Feature: Browse dishes (backend-only)

  Background:
    Given a fresh backend context

  Scenario: Browse dishes without login
    Given I am not logged in
    When I access SophiaTech Eats
    Then I can see dishes from restaurants but cannot order.

  Scenario: Browse dishes as Campus User
    Given I am logged in
    When I browse restaurant menus
    Then I see all dish information including tags and prices.
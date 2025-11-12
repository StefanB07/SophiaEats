# SopiaTech Eats-Team-U-25-26

## TEAM

PO : BUCUR Stefan
SA : ILIESCU Miruna
QA : CRISTEA Ana
Ops : NEATA Mihnea

## Usage & Installation
As of the moment of the O1/D1, there's 3 ways to interact with the project. 
There is a order loop in main - just run the main. It will make the order process from start to end apparent.
The cucumber (integration) tests can be run from src/test/java/RunCucumberTest.java (how we did it - straight from IntelliJ) or with maven separately (from command line for example).
There are JUnit tests as well in src/test/java/unit. They can be run by right clicking the 'unit' package and selecting 'Run tests in unit' (how we did it) - or maven as well.
Installation - just fork this repository and clone it locally. 

You need Java level 21 (so Java1.21) , openJDK 24 and maven installed on your machine. Java 1.17 might work as well (and a lower jdk - if you look in pom.xml, which is the one already given, I left it as java ver 17 for simplicity), but that's what we built on.

## Installation & running short version:
1. Clone the repository. 2
2. Run the demo flow (order loop):
    - From IDE: run the main class in `src/main/java/main` (the class that starts the order loop).
3. Run tests from IDE:
    - Unit tests in `src/test/java/unit`
    - Cucumber runner: `src/test/java/RunCucumberTest.java`

## .github - Kanban
   Here's the link: https://github.com/orgs/PNS-Conception/projects/95
    You will find here the kanban board for the project. In short - each of us tried to pick a user story - work on the tests and implementation, then we merged branches together.


## Structure
 - pom.xml :  
       - Cucumber 7 et JUnit 5  
       - JDK 21
       - Etc.  
    - src/main/java has the main code for the project
    - > bootstrap/: contains a data seeder for initial data
    - > model/: domain contains the main classes/entities of the project
    - > service/: contains the business logic of the project ( they act as a sort of interface to interact and manage the cart and order)
    - > repository/: contains the data access layer ( in memory for now) and it also links some of the classes in between so that they are decoupled.
    - > main/: contains the main class that runs the order loop - used for testing as of now but will eventually contain the server code.
    - src/test/java has the test code for the project
    - > unit/: contains the unit tests for the project ( JUnit 5)
    - > features/: contains the gherkin syntax tests ( Cucumber 7)
    - > steps/: contains the step definitions for the cucumber tests
    - > RunCucumberTest.java : the class that runs the cucumber tests


## Overview

The **Catalog Service** is a lightweight, read-only backend module that exposes restaurant and menu data.  
It is responsible for listing all available restaurants, providing detailed menu information,  
and supporting filtering by cuisine type, price range, or dietary tags.

This service operates independently on port **8081** and uses in-memory seeding (no database)  
via `DataSeeder.java` to populate sample data for testing and development.  
It serves as the data source for the **Order Service** and is later integrated through the **API Gateway**.

| Method | URL                       | Descriere                                 |
| ------ | ------------------------- |-------------------------------------------|
| GET    | `/restaurants`            | List all restaurants                      |
| GET    | `/restaurants/{name}`     | Show details and menu for a restaurant    |
| GET    | `/restaurants/filter?...` | Filter by criteria (cuisine, price, etc.) |
| GET    | `/health`                 | Check service status ({"status":"UP"})    |


   

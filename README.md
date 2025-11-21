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

You need Java level 21 (so Java1.21) , openJDK 24 and maven installed on your machine. Java 1.17 might work as well (and a lower jdk, if you look in pom.xml, which is the one already given, I left it as java ver 17 for simplicity), but that's what we built on.

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



# Local Development Setup
## How to run the project locally (full stack)

> ⚠️ Until everything is merged to `main`, please use the branch
> `feature/integration-gateway-frontend` when you want to run the full stack (backend + gateway + frontend).

### 0. Prerequisites

* Java 17+
* Maven
* Node.js **>= 20** (Vite needs this)
* npm

---

## 1. Backend & API Gateway

The backend and the gateway are all started from **one single Java main class**:

**`server.ApiGatewayMain`**

When this class starts, it automatically starts:

* `CatalogServiceMain` (Catalog service, port 8081)
* `OrderServiceMain` (Order service, port 8082)
* the HTTP **API Gateway** on **port 8080**

So you do **NOT** need to run the services separately.

### Option A – Start from IntelliJ (recommended)

1. Open the project in IntelliJ.
2. Open `src/main/java/server/ApiGatewayMain.java`.
3. Click the green ▶️ icon next to `public class ApiGatewayMain` and choose
   **“Run 'ApiGatewayMain.main()'”**.
4. In the Run console you should see something like:

   ```text
   Gateway listening on http://localhost:8080
   ```

   (and logs for CatalogService / OrderService).

To **stop** the backend + gateway:
→ click the red ⏹️ **Stop** button in IntelliJ.

### Option B – Start from command line

From the project root:

```bash
mvn exec:java -Dexec.mainClass="server.ApiGatewayMain"
```

To stop: press **Ctrl + C** in that terminal.

### Quick manual check

Open in a browser or Postman:

```text
GET http://localhost:8080/restaurants
```

You should see the JSON list of restaurants (e.g. “Second Place”, “Restaurant A”).

---

## 2. Frontend (React + Vite)

Frontend code lives in the `frontend/` folder.

### 2.1 Install dependencies (only first time)

From the project root:

```bash
cd frontend
npm install
```

### 2.2 Environment configuration

In `frontend/.env` make sure you have:

```env
# Base URL for the Catalog API via the gateway
VITE_CATALOG_API_BASE=http://localhost:8080
```

> Note: For now we call the gateway directly on `/restaurants`.
> Later we can switch to `/api/catalog/...` just by changing `.env` and the gateway mapping.
> The frontend code does **not** need to change.

### 2.3 Start the frontend dev server

From `frontend/`:

```bash
npm run dev
```

Vite will start on **[http://localhost:5173](http://localhost:5173)**.

To **stop** the frontend dev server:
→ press **Ctrl + C** in that terminal.

---

## 3. Startup order

Recommended order for everyone:

1. **Git / branch**

   ```bash
   git checkout feature/integration-gateway-frontend
   git pull
   ```
2. **Start backend + gateway**

    * Either via IntelliJ → Run `ApiGatewayMain`
    * Or via terminal: `mvn exec:java -Dexec.mainClass="server.ApiGatewayMain"`
3. **Start frontend**

   ```bash
   cd frontend
   npm run dev
   ```
4. Open the app in the browser:
   👉 `http://localhost:5173/`

---

## 4. What to expect

* On `http://localhost:5173/`
  → you should see the **restaurant list** (US2).
* Clicking **“View menu →”** on a restaurant
  → goes to `/restaurants/<name>` and shows the **menu page** with dishes (US3).
* All data comes through the **gateway**:

    * `GET http://localhost:8080/restaurants`
    * `GET http://localhost:8080/restaurants/{name}`


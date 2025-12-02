# SopiaTech Eats – Team U (2025)

This repository implements a small multi-service food ordering system with a simple API Gateway and a React frontend. The goal of TD4 is to expose the backend through clean REST APIs, wire an API gateway, and deliver a usable web UI.

## Team members and roles
- Product Owner (PO): BUCUR Stefan
- Software Architect (SA): ILIESCU Miruna
- QA : CRISTEA Ana
- Ops: NEATA Mihnea

---

## How to install, run and test

Prerequisites:
- Java 17+
- Maven 3.8+
- Node.js 20+ and npm (for the frontend)

### Backend and API Gateway (all-in-one run)
We provide a single main that starts all servers:
- Catalog service on http://localhost:8081
- Order service on http://localhost:8082
- API Gateway on http://localhost:8080

Run from IDE:
- Open `src/main/java/server/ApiGatewayMain.java`
- Run the `main` method. You should see “Gateway listening on http://localhost:8080”.

Run from terminal (project root):
- mvn -q -DskipTests exec:java -Dexec.mainClass="server.ApiGatewayMain"

Quick smoke checks (direct services):
- GET http://localhost:8081/health → {"status":"UP"}
- GET http://localhost:8082/health → {"status":"UP"}
- Through gateway for catalog: GET http://localhost:8080/restaurants

### Frontend (React + Vite)
- cd frontend
- npm install
- npm run dev
- Open http://localhost:5173

### Running tests
- All unit and cucumber tests: mvn -q test
- Import Postman collection: `http/OrderService.postman_collection.json` and run the “Order Service” folder with header X-User-Id set (e.g., alice@campus).

---

## Project structure
- pom.xml – Maven build (Java 17, JUnit5, Cucumber for tests)
- src/main/java
    - bootstrap/
        - `DataSeeder.java` – resets repositories and seeds demo data for both services (users, restaurants, dishes, delivery locations and slots). Uses helper `nextHalfHourNow()` to align delivery slots to the next half-hour.
    - domain/
        - Core entities and value objects:
            - `Restaurant`, `Dish`, `DishCategory`, `DietaryTag`
            - `Cart`, `OrderItem`, `Order`, `OrderStatus`
            - `DeliveryLocation`, `DeliverySlot`
            - `CampusUser`, `StudentCredit`, `Payment`, `PaymentMethod`
            - `FilterCriteria`, `RestaurantFilters`
    - repository/ (in-memory stores)
        - `RestaurantRepository` – CRUD by restaurant name (seeded with sample restaurants and dishes)
        - `DeliveryCatalogRepository` – holds delivery locations and per-restaurant slots (capacity)
        - `CartRepository` – manages carts; includes `getOrCreateForUserId(userId)` for per-user cart
        - `OrderRepository` – persists created orders (lookup by id, optional list by user if implemented)
        - `CampusUserRepository` – stores users and their student credit
    - service/
        - `CatalogService` – read operations for restaurants, menu, filters; reads from `RestaurantRepository` and `DeliveryCatalogRepository`
        - `CartService` – per-user cart operations; uses `CartRepository` and `RestaurantRepository` (add/clear/notify listeners)
        - `OrderService` – order creation & validation (delivery slot rules, payment via providers)
        - `PaymentProvider` (interface), `PaymentProviders`, `DummyExternalPaymentProvider` – abstraction and demo provider implementations
        - `OrderDraftService` – helper for draft flows (if used in tests)
    - handlers/
        - `CatalogApiHandler` – HTTP for Catalog service
            - GET `/restaurants`, `/restaurants/{name}`, `/restaurants/filter`
            - Delivery read: GET `/delivery/locations`, `/delivery/slots?restaurant=...`
            - Manager (optional/TD scope): POST/PUT/DELETE dish; slot management endpoints
        - `OrderApiHandler` – HTTP for Order service
            - GET `/cart`, DELETE `/cart`
            - POST `/cart/items` (add item)
            - POST `/orders`, GET `/orders/{id}` (and optionally GET `/orders` if repo supports)
            - Requires header `X-User-Id` on all endpoints; clears cart after successful order
        - `GatewayHandler` – API Gateway: forwards `/restaurants` and `/delivery` to 8081; `/cart`, `/orders`, `/users` to 8082; passes through `X-User-Id`
        - `UsersApiHandler` – simple user listing/lookup (useful for testing student credit)
        - `BaseHandler` – shared HTTP utilities (error JSON, body read, escaping, CORS helpers)
    - server/
        - `CatalogServiceMain` (port 8081): seeds data and mounts `CatalogApiHandler` on `/restaurants` and `/delivery` + `/health`
        - `OrderServiceMain` (port 8082): seeds data and mounts `OrderApiHandler` on `/cart`, `/orders` + `/health` (and `/users` via `UsersApiHandler`)
        - `ApiGatewayMain` (port 8080): starts the two services in daemon threads and exposes `GatewayHandler` root `/`
- frontend/ – React app (Vite)
    - `src/` – UI pages and components
        - `App.jsx` – main router/entry
        - `pages/` – pages (restaurants list, details, cart/order if applicable)
        - `context/` – shared state for frontend (if used)
        - `data/` – mock data or API wrappers (if used)
    - `vite.config.js`, `index.html`, `eslint.config.js`
- http/ – REST client examples and Postman
    - `restaurants.http` – quick GETs for catalog endpoints
    - `order.http` – quick calls for order/cart endpoints (requires `X-User-Id`)
    - `OrderService.postman_collection.json` – import into Postman for Order service tests
- doc/
    - `API.md` – endpoint documentation and JSON schemas (Cart, Order, Restaurant, Delivery)
    - `Screenshots.md` – paste UI screenshots for the report
    - `PointsDistribution.md` – team points breakdown

See screenshots and UI notes: [doc/Screenshots.md](doc/Screenshots.md)

---

## Architecture overview
- Three-layer approach kept simple for the module: Frontend (React) → API Gateway → Services (Catalog, Order).
- API Gateway: single entry point, forwards requests to services, passes X-User-Id.
- Services are separated by domain but share in-memory repositories/data seeding for the prototype.

Routing summary:
- Catalog service (8081):
    - GET /restaurants, GET /restaurants/{name}, GET /restaurants/filter
    - GET /delivery/locations (list delivery places)
    - GET /delivery/slots?restaurant={name} (available delivery slots for a restaurant)
- Order service (8082):
    - GET /cart, DELETE /cart
    - POST /cart/items (add), DELETE /cart/items?menuItemId=… (if supported)
    - POST /orders, GET /orders (if supported), GET /orders/{id}
    - All order endpoints require header `X-User-Id`.
- API Gateway (8080): forwards catalog paths (including /restaurants and /delivery).

Constraints respected:
- No external web frameworks for backend (pure HttpServer + basic helpers).
- Manual JSON parsing.
- In-memory data with shared seeding to keep menu/price aligned between services.

---

## Troubleshooting
- “Connection refused on 8082”: make sure `OrderServiceMain` is running (start `ApiGatewayMain`).
- 400 on Order API: check `X-User-Id` header is present.
- 409 on POST /orders: delivery slot constraints triggered (expected behavior from OrderService).
- Frontend cannot load data: verify gateway logs and that Catalog service is up (8081).

---

## Previous README (kept for reference)

// ...existing content from earlier README retained below ...

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

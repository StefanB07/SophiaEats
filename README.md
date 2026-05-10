## 1. The APP

The application is a simple food ordering system for a campus environment, allowing users to browse restaurants, view menus, build a cart, and place orders with delivery options. It consists of:

---

## 2. Technology & constraints

Backend (Java):

* JSON is handled manually using the Jackson library.
* Services split into **Catalog** and **Order**, exposed via REST
* Single **API Gateway** that acts over the services

Frontend (Web):

* **React + Vite** for a simple web UI
* Focus on clear user flows:

    * browse restaurants
    * see menus and dietary info
    * build a cart and choose a delivery slot
    * simulate payment

---

## 3. How to install, run and test

### 3.1 Prerequisites

* **Java 17+**
* **Maven 3.8+**
* **Node.js 20+** and **npm** (for the frontend)

---

### 3.2 Backend and API Gateway (all-in-one run)

We provide a single main that starts all servers:

* **Catalog Service** on `http://localhost:8081`
* **Order Service** on `http://localhost:8082`
* **API Gateway** on `http://localhost:8080`

#### From IDE (IntelliJ)

1. Open `src/main/java/server/ApiGatewayMain.java`
2. Run the `main` method
3. You should see in the console:

   ```text
   Gateway listening on http://localhost:8080
   ```

#### From terminal (project root)

```bash
mvn -q -DskipTests exec:java -Dexec.mainClass="server.ApiGatewayMain"
```

#### Quick smoke checks (direct services)

* `GET http://localhost:8081/health` → `{"status":"UP"}`
* `GET http://localhost:8082/health` → `{"status":"UP"}`
* Through gateway (Catalog):
  `GET http://localhost:8080/restaurants`

---

### 3.3 Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Then open: **[http://localhost:5173](http://localhost:5173)**

Environment configuration (`frontend/.env`):

```env
VITE_CATALOG_API_BASE=http://localhost:8080
```

---

### 3.4 Running tests

* **All unit and Cucumber tests**:

  ```bash
  mvn -q test
  ```
  Or from the IDE.
* **Postman**:
    * We provide a shortened Postman collection: `http/OrderService.postman_collection.json`
    * You can import it and manually trigger the requests you are interested in (with header, for example `X-User-Id: alice@campus`).
    * Mostly a reference - a more complete one is separate.
---

### 3.5 Legacy usage: order loop (O1 / D1)

From the first phase of the project (before exposing HTTP APIs), there is an **order loop main** that simulates the full order process in the console:

* Main class in `src/main/java/main` (CLI flow)
* Shows end-to-end process from restaurant selection to order confirmation
* Still useful as a **demo of the core domain logic** without HTTP / frontend

---

## 4. Local development setup (full stack)

Recommended workflow during development:

1. **Backend + Gateway**

    * From IDE: run `server.ApiGatewayMain`
    * Or from terminal:

      ```bash
      mvn exec:java -Dexec.mainClass="server.ApiGatewayMain"
      ```

2. **Frontend**

   ```bash
   cd frontend
   npm run dev
   ```

3. Open the app:

   `http://localhost:5173/`

### What to expect

* On `/` → restaurant list (US2)
* On `/restaurants/<name>` → restaurant details and menu (US3)
* Cart, delivery, and order confirmation flows are wired to the Order service through the gateway.

All the data used by the frontend comes **only through the API Gateway**:

* `GET http://localhost:8080/restaurants`
* `GET http://localhost:8080/restaurants/{name}`
* `GET http://localhost:8080/delivery/...`
* `GET/POST http://localhost:8080/cart` / `/orders`

---

## 5. Detailed project structure

### 5.1 Root & build

* **`pom.xml`**

    * Java 17
    * JUnit 5
    * Cucumber 7
    * Jackson (JSON)
    * Maven plugins for compilation and test execution

* **`.github` / GitHub Project**

    * Kanban board:
      [https://github.com/orgs/PNS-Conception/projects/95](https://github.com/orgs/PNS-Conception/projects/95)

---

### 5.2 Backend (src/main/java)

#### 5.2.1 `bootstrap/`

* **`DataSeeder.java`**

    * Resets and seeds demo data for all repositories:

        * Restaurants & dishes (with categories and tags)
        * Delivery locations and delivery slots
        * Campus users and student credits
    * Uses helper:

        * `nextHalfHourNow()` to align delivery slot times to the next half-hour for a more realistic schedule.

---

#### 5.2.2 `domain/` – Core entities and value objects

Represents the **business model** shared by the services:

* **Restaurant & Menu**

    * `Restaurant`
    * `Dish`
    * `DishCategory`
    * `DietaryTag` (vegetarian, vegan, etc.)

* **Cart & Orders**

    * `Cart`
    * `OrderItem`
    * `Order`
    * `OrderStatus` (e.g., DRAFT / CONFIRMED / CANCELLED)

* **Delivery**

    * `DeliveryLocation`
    * `DeliverySlot` (time window + capacity constraints)

* **Users & Payments**

    * `CampusUser`
    * `StudentCredit`
    * `Payment`
    * `PaymentMethod` (e.g. student credit, card, etc.)

* **Filtering**

    * `FilterCriteria`
    * `RestaurantFilters`
      Used for filtering restaurants by availability, dietary tags, etc.

These types are intentionally simple and reusable between Catalog and Order to keep the codebase coherent for a teaching project.

---

#### 5.2.3 `repository/` – In-memory data stores

Implements simple, in-memory persistence for the prototype:

* **`RestaurantRepository`**

    * CRUD operations on restaurants
    * Seeded with example restaurants and dishes
    * Serves as data source for restaurant listing, menu retrieval and filtering

* **`DeliveryCatalogRepository`**

    * Stores delivery locations
    * Stores per-restaurant **delivery slots** and their **capacity**
    * Used to validate if a slot is still available when creating an order

* **`CartRepository`**

    * Manages per-user carts
    * Key method: `getOrCreateForUserId(userId)`
      → ensures each user has a single active cart

* **`OrderRepository`**

    * Persists created orders
    * Look up by order id
    * (Optionally) list by user, if needed

* **`CampusUserRepository`**

    * Stores campus users
    * Keeps track of `StudentCredit` used in payment

Repositories are injected into services and handlers, keeping logic separated
from storage and allowing easy replacement (e.g., with a real database later).

---

#### 5.2.4 `service/` – Business logic

Encapsulates the application logic of each service:

* **`CatalogService`**

    * Read-only operations for restaurants and menus:

        * list restaurants
        * get details for a restaurant
        * filter restaurants by criteria (category, dietary tags, possibly time)
    * Uses:

        * `RestaurantRepository`
        * `DeliveryCatalogRepository` (for delivery-related information)

* **`CartService`**

    * Per-user cart operations:

        * get or create cart for `userId`
        * add dish to cart (validating it belongs to the right restaurant)
        * clear cart
    * Uses:

        * `CartRepository`
        * `RestaurantRepository` (to validate dishes)
    * Can notify listeners on cart changes (if extended).

* **`OrderService`**

    * Responsible for:

        * validating cart content
        * checking **delivery slot availability / capacity**
        * applying payment rules (student credit, external provider, etc.)
        * creating and storing orders
    * Ensures that:

        * a cart is associated to a single restaurant
        * delivery slots are updated to reflect new orders
        * cart is cleared after successful order creation.

* **Payment abstraction**

    * `PaymentProvider` (interface)
    * `PaymentProviders` (factory / registry)
    * `DummyExternalPaymentProvider` (simple mock implementation of an external payment system)
    * This respects the spec requirement of possibly going through a proxy towards a payment service.

* **`OrderDraftService`** (if used)

    * Helper service to manage draft orders or intermediate steps in tests.

---

#### 5.2.5 `handlers/` – HTTP API layer

Bridges between HTTP requests and services. All handlers extend **`BaseHandler`**, which provides:

* JSON serialization/deserialization with Jackson
* Request body reading helpers
* Error handling helpers (JSON error responses)
* CORS and header utilities

Concrete handlers:

* **`CatalogApiHandler`** – Catalog Service HTTP API

    * `GET /restaurants` – list all restaurants
    * `GET /restaurants/{name}` – details and menu for a single restaurant
    * `GET /restaurants/filter?...` – filtering endpoint (e.g. by category/tags)
    * **Delivery endpoints**:

        * `GET /delivery/locations` – list all delivery places
        * `GET /delivery/slots?restaurant=...` – available slots for a restaurant

  (Optional / extended scope)

    * POST/PUT/DELETE endpoints for dish and slot management (for a restaurant manager UI).

* **`OrderApiHandler`** – Order Service HTTP API

    * **Cart**

        * `GET /cart` – get current user cart
        * `DELETE /cart` – clear current cart
        * `POST /cart/items` – add item to cart

            * uses body JSON with dish and quantity
    * **Orders**

        * `POST /orders` – create new order:

            * validates delivery slot
            * validates payment
            * clears cart on success
        * `GET /orders/{id}` – fetch a specific order
        * Optionally: `GET /orders` – list orders by user
    * All endpoints **require** header:

      ```http
      X-User-Id: <user-email>
      ```

* **`UsersApiHandler`**

    * Simple endpoints to:

        * list users
        * look up a user
    * Used mainly for testing payments and student credit in the UI.

* **`GatewayHandler`** – API Gateway

    * Exposes a single entrypoint (port **8080**) and forwards to services:

        * Forwards `/restaurants` and `/delivery` to **Catalog** (8081)
        * Forwards `/cart`, `/orders`, `/users` to **Order** (8082)
        * Preserves and passes through `X-User-Id`.
    * Implements the façade / API gateway pattern requested in the spec.

---

#### 5.2.6 `server/` – Service launchers and gateway

* **`CatalogServiceMain`** (port 8081)

    * Seeds data with `DataSeeder`
    * Mounts `CatalogApiHandler` on `/restaurants` and `/delivery`
    * Exposes `/health`

* **`OrderServiceMain`** (port 8082)

    * Seeds data with `DataSeeder`
    * Mounts:

        * `OrderApiHandler` on `/cart` and `/orders`
        * `UsersApiHandler` on `/users`
        * `/health` endpoint

* **`ApiGatewayMain`** (port 8080)

    * Starts both services (Catalog + Order) in daemon threads
    * Starts gateway server with `GatewayHandler` at root `/`
    * Main entry point used in development and for the demo.

---

### 5.3 Frontend (React + Vite)

Located in `frontend/`:

* `src/`

    * **`App.jsx`**

        * Main entry point and routing.
    * **`pages/`**

        * Restaurant list page
        * Restaurant details / menu page
        * Cart & delivery page
        * Order confirmation page (depending on final implementation)
    * **`context/`**

        * Shared state using React Context:

            * Cart context (items, delivery options, etc.)
            * User context (current user, list of users from `/users`)
    * **`data/`**

        * Mock data or small API wrappers, if needed.

Other files:

* `vite.config.js` – Vite configuration
* `index.html` – base HTML
* `eslint.config.js` – linting rules

The frontend calls only the **Gateway** (not the services directly), via `VITE_CATALOG_API_BASE`.

---

### 5.4 HTTP tools & documentation

* **`http/`**

   * `OrderService.postman_collection.json` – Postman collection for Order service tests.

* **`doc/`**

    * `API.md` – endpoint documentation and JSON schemas for:

        * Cart
        * Order
        * Restaurant
        * Delivery
    * `Screenshots.md` – screenshots of the UI to visually show the implemented flows.

---

### 5.5 Tests (src/test/java)

* **`unit/`**

    * JUnit 5 tests targeted at:

        * services (CatalogService, CartService, OrderService)
        * domain logic (e.g., delivery slot capacity, order total, etc.)

* **Cucumber BDD tests**

    * `features/` – Gherkin feature files, describing scenarios (e.g., placing an order, validating delivery slots)
    * `steps/` – step definition classes linking Gherkin steps to Java code
    * `RunCucumberTest.java` – Cucumber test runner

You can run tests from IntelliJ directly or via Maven (`mvn test`).

---

## 6. Architecture overview

We keep a simple **three-layer** architecture adapted to the module:

1. **Frontend (React)**
2. **API Gateway**
3. **Backend services**: Catalog and Order

Key points:

* Gateway is the **only entrypoint** for the frontend.
* Catalog and Order are **logically separate** services with dedicated routes and responsibilities.
* Data is stored in **in-memory repositories** and seeded at startup for the purpose of the TD.

Routing summary:

* **Catalog service (8081)**:

    * `GET /restaurants`
    * `GET /restaurants/{name}`
    * `GET /restaurants/filter`
    * `GET /delivery/locations`
    * `GET /delivery/slots?restaurant={name}`
* **Order service (8082)**:

    * `GET /cart`, `DELETE /cart`
    * `POST /cart/items`
    * `POST /orders`
    * `GET /orders/{id}`
    * (optional) `GET /orders`
    * All require `X-User-Id` header.
* **API Gateway (8080)**:

    * Forwards all catalog-related paths to 8081.
    * Forwards `/cart`, `/orders`, `/users` (order related paths) to 8082.

---

## 7. Functional coverage

We implement the core **MUST** functionalities of the TD:

1. **Order taking**

    * Use dish categories for selection
    * Support for dish extensions/add-ons
    * Display possible delivery times (slots) that evolve according to:

        * user’s cart
        * existing orders / capacity
    * Payment via a proxy-like payment provider abstraction
    * Order validation and confirmation; cart cleanup on success

2. **Navigation among restaurants and menus**

    * Browse restaurants
    * View menus
    * Filter by availability, dish type, and dietary options

3. **Add a dish**

    * API-level capability to add / manage dishes (possibly mocked or protected for manager UI)

---

## 8. Additional documentation

For visual illustration of the implemented user flows, please see:
! THIS IS FROM AN OLDER FRONTEND VERSION
 [Screenshots.md – UI screenshots](./doc/Screenshots.md)



---

## 9. Troubleshooting

* **“Connection refused on 8082”**

    * Check that `ApiGatewayMain` is running (it starts OrderServiceMain).
* **HTTP 400 on Order API**

    * Most likely missing `X-User-Id` header.
* **HTTP 409 on `POST /orders`**

    * Check:

        * Gateway logs
        * Health of Catalog (`/health` on 8081)
        * `VITE_CATALOG_API_BASE` in `.env`.

---
awesome—ai deja un „schelet” backend perfect ca să lucrați în paralel. Iată logica și de ce am ales așa:

# Cum e organizat codul (și de ce)

* **Domain curat** (`Restaurant`, `Dish`, `Cart`, `OrderItem`, `CampusUser`):
  Obiectele tale de business nu știu nimic despre HTTP/JSON. Asta ne lasă liberi să schimbăm transportul (REST, CLI, gRPC) fără să atingem logica domeniului.

* **Repository pattern (in-memory acum)**
  `RestaurantRepository`, `CartRepository`, `CampusUserRepository` fac CRUD simplu în memorie.
  👉 Beneficiu: handler-urile nu știu *unde* sunt datele. Mâine poți schimba cu un repo pe fișiere sau DB fără să atingi HTTP.

* **Handlers per entitate (REST minim)**
  `RestaurantHandler`, `CartHandler`, `CampusUserHandler` mapează rute → operații pe repo:

  * `GET /restaurants` → listă
  * `GET /restaurants/{name}` → detaliu
  * `POST /restaurants` (CSV: `name|cuisine|priceRange`) → creare
  * `POST /restaurants/{name}/dishes` (CSV: `dishName|desc|price|category|type`) → adăugare dish
  * `GET /cart` → status + total
  * `POST /cart` (sau `/cart/add`) → adaugă item (CSV: `dish|qty|restaurant`)
  * `GET /users` → listă users (demo)

  👉 Beneficiu: fiecare resursă are „controller”ul ei; crește ușor.

* **BaseHandler (utilitare comune)**
  Metode pentru citit body, trimis JSON/text, escape.
  👉 Beneficiu: nu duplici cod; toate handler-urile au același mod de răspuns (Content-Type, encoding, status codes).

* **HTTP codes corecte**
  200 (OK), 201 (Created), 400 (Bad request), 404 (Not found), 405 (Method not allowed), 500 (Server error).
  👉 Beneficiu: frontul și testele pot reacționa previzibil (e vital când scrii BDD/TU).

* **Protocolul de input ultra-simplu (CSV cu “|”)**
  Am evitat dependențe. Când vreți, îl schimbăm pe JSON cu o singură dependență (Gson/Jackson) fără să atingeți domain + repo.
  👉 Beneficiu: pornești repede; migrarea la JSON e trivială.

# Ce rezolvă concret acum

* **Rulezi aplicația și poți testa cap-coadă**: creezi restaurante, adaugi feluri, pui în coș, citești total.
* **Colegul „de server”** (sau frontend) are deja rute stabile de bătut cu `curl`/Postman/UI.
* **Poți scrie BDD pe bune**: scenariile din TD3 (ex. „adaug în coș” → „total corect”) pot lovi direct handler-ele sau, și mai bine, serviciile pe care le vom introduce imediat.

# Cum te ajută în dezvoltările viitoare

* **Schimb de stocare fără dureri**
  Azi: in-memory. Mâine: `RestaurantRepository` → `RestaurantRepositoryJdbc`/`Jpa`. Handler-ele rămân identice.

* **Trecere ușoară la JSON + DTO-uri**
  Înlocuiești intrările CSV cu JSON (Gson/Jackson). Introduci DTO-uri (`CreateRestaurantDTO`, `AddDishDTO`) ca să nu expui direct modelul de domeniu. Handler-ele doar mapează DTO ↔ domain.

* **Introducem Services (logică de business mai bogată)**
  Când apar reguli: capacitate restaurant, ferestre orare, prețuri promo, validări, plăți… creezi `OrderService`, `CartService`, `RestaurantService`.
  Handler-ele vor apela serviciile, nu repo-urile direct (separi și mai clar: HTTP ↔ business).

* **Testare serioasă**

  * Unit: pe domain/services (fără HTTP).
  * Integrare: rulezi handler-ele cu un `HttpServer` real (cum e acum) sau cu un test harness.
  * BDD (Cucumber): scrii scenarii și pot trece fără UI.

* **Scalare/Framework**
  Când vrei, muți aceeași structură în Spring Boot: `@RestController` în loc de `HttpHandler`, `@Repository` în loc de clasele in-memory. Designul actual se potrivește natural.

# De ce alegerile astea (trade-offs)

* **Simplitate > „framework magic”**: minimal deps, pornește instant, ușor de urmărit la corecție.
* **Separare de responsabilități**: Domain ≠ HTTP, Repository ≠ Handler. Claritate la revizie.
* **Extensibilitate**: poți introduce servicii, validări, autentificare fără refactor masiv.

# Ce aș face imediat după

1. **Order flow minim**

   * `Order` + `OrderHandler`: `POST /orders` (creează din coș), `GET /orders/{id}`.
   * `OrderService.placeOrder(cart, deliveryPlace, deliveryTime)` cu: coș non-gol, total calculat, status `CREATED`.

2. **Trecere la JSON pentru POST-uri**

   * Adaugă Gson și schimbă parsingul.
   * Creează DTO-uri și validări (ex: `price > 0`, `qty >= 1`).

3. **Test BDD pentru coș și comandă**

   * Feature „add to cart → total corect” și „place order → status CREATED”.

Dacă vrei, îți transform în 5 minute un handler (ex. `RestaurantHandler`) să primească JSON + îți scriu DTO-urile, sau schițăm `OrderHandler` + `OrderService` ca următor pas.


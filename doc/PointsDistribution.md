# Points distribution (Team U)

- BUCUR Stefan (PO): ../100 
- ILIESCU Miruna (SA):  ../100
- CRISTEA Ana (QA): ../100
- NEATA Mihnea (Ops): ../100

A split per service was used during TD4:
- ILIESCU Miruna  (Catalog): read-only Catalog API (/restaurants, /restaurants/{name}, /restaurants/filter)
- CRISTEA Ana (Order): per-user cart and orders (/cart, /cart/items, /orders)
- BUCUR Stefan (Gateway): HTTP proxy routing /api/catalog/** and /api/order/** to services
- NEATA Mihnea (Ops/Bugfix): CI/CD workflow, Kanban management, Order history, filtering, bug fixes
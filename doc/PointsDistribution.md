# Points distribution (Team U)

Provide a short justification of how the final grade points are distributed across the team members.
You can use either percentages or a fixed point budget (e.g. 100 points total).

Example template (replace with your own):

- BUCUR Stefan (PO): 25 pts — backlog management, acceptance criteria, demo prep
- ILIESCU Miruna (SA): 30 pts — architecture & diagrams, gateway design, catalog API
- CRISTEA Ana (QA & Docs): 25 pts — test plans, API docs, screenshots, Postman collections
- NEATA Mihnea (Ops): 20 pts — CI, scripts, local dev setup, troubleshooting

A split per service was used during TD4:
- ILIESCU Miruna  (Catalog): read-only Catalog API (/restaurants, /restaurants/{name}, /restaurants/filter)
- CRISTEA Ana (Order): per-user cart and orders (/cart, /cart/items, /orders)
- BUCUR Stefan (Gateway): HTTP proxy routing /api/catalog/** and /api/order/** to services

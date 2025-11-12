# Order Service API

All endpoints require header `X-User-Id: <string>`.

Error model:
- JSON `{"error":"message","status":<code>}`

## GET /cart
Response:
- 200 `{"userId":"...","total":<number>,"items":[{"name":"...","qty":<int>,"lineTotal":<number>},...]}`

## POST /cart/items
Body (application/json):
- `{"restaurant":"<name>","dish":"<name>","qty":<int>}`

Responses:
- 201 `{"userId":"...","added":"<dish>","qty":<int>}`
- 400 on bad input
- 404 if restaurant/dish not found

## POST /orders
Body (text/plain):
- `deliveryPlace|deliveryTime`
- deliveryTime: `yyyy-MM-dd HH:mm` or ISO `yyyy-MM-ddTHH:mm`

Responses:
- 201 order JSON (see schema)
- 400 on invalid place/time/cart

Order schema:

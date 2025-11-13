# Order Service API

All endpoints require header `X-User-Id: <string>`.

Error model:
- JSON `{"error":"message","status":<code>}`

## GET /cart

Returns the active cart for the caller identified by `X-User-Id`.  
If the user has no cart yet, an empty cart record is created on the fly.

Response:
- 200 — `application/json`

```
{
  "userId": "user-1",
  "total": 26.5,
  "items": [
    {
      "name": "Pizza Margherita",
      "qty": 2,
      "lineTotal": 17.0
    },
    {
      "name": "Tiramisu",
      "qty": 1,
      "lineTotal": 9.5
    }
  ]
}
```

## POST /cart/items

Adds an item to the caller’s cart. The cart is scoped to the `X-User-Id` header.

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
- The cart is automatically cleared after a successful order.

Responses:
- 201 order JSON (see schema)
- 400 on invalid place/time/cart

Order schema:
```
{
  "id": "b8c6d6bc-820d-4d50-8e51-7af0d75792ef",
  "status": "CREATED",
  "createdAt": "2025-11-13T10:15:42.123456",
  "deliveryPlace": "Bât A",
  "deliveryTime": "2025-11-13T10:45:00",
  "total": 26.5,
  "items": [
    {
      "name": "Pizza Margherita",
      "qty": 2,
      "lineTotal": 17.0
    },
    {
      "name": "Tiramisu",
      "qty": 1,
      "lineTotal": 9.5
    }
  ]
}
```

## GET /orders/{id}

Returns the persisted order by id.

Response:
- 200 — order schema as above
- 404 — order not found

# Orders API - Customer

Base URL: `/v1/orders`

All endpoints require **JWT Authentication** (`Bearer <token>`) and **CUSTOMER** role.

---

## Enums

### OrderStatus

| Value | Description |
| --- | --- |
| `PENDING` | Just created, awaiting payment |
| `PLACED` | Payment confirmed |
| `CONFIRMED` | Vendor confirmed |
| `PACKED` | Ready to ship |
| `SHIPPED` | In transit |
| `DELIVERED` | Completed |
| `CANCELLED` | Cancelled |
| `REFUNDED` | Money returned |

### PaymentStatus

| Value | Description |
| --- | --- |
| `PENDING` | Awaiting payment |
| `PAID` | Payment successful |
| `FAILED` | Payment failed |
| `REFUNDED` | Money returned |

### OrderItemStatus

| Value | Description |
| --- | --- |
| `ACTIVE` | Item is active |
| `CANCELLED` | Item has been cancelled |

### CancellationReason

| Value |
| --- |
| `CHANGED_MIND` |
| `NO_LONGER_NEEDED` |
| `BELIEVE_FAKE` |
| `NO_REASON` |
| `OTHER` |

---

## Order Flow

```
Cart ──> Checkout (PENDING) ──> Payment ──> PLACED ──> CONFIRMED ──> PACKED ──> SHIPPED ──> DELIVERED
                                  │
                                  ├── Payment failed → stays PENDING (paymentStatus: FAILED)
                                  │
                                  └── Cancel → CANCELLED (allowed before SHIPPED)
```

**Key behaviors:**
- Checkout creates the order in `PENDING` status with `paymentStatus: PENDING`
- Cart is **NOT** cleared until payment succeeds
- Stock is **NOT** deducted until payment succeeds
- On successful payment: status becomes `PLACED`, stock is deducted, cart is cleared
- On failed payment: `paymentStatus` becomes `FAILED`, order stays `PENDING`
- Cancellation restores stock if payment was already made
- If all items in an order are individually cancelled, the order auto-cancels
- VAT is calculated at **15%** (Saudi Arabia)

---

## Endpoints

### 1. Checkout - Create Order from Cart

Creates an order from the user's current cart items.

```
POST /v1/orders/checkout
```

**Request Body:**

```json
{
  "addressId": "123e4567-e89b-12d3-a456-426614174000",
  "notes": "Please call before delivery",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `addressId` | UUID | Yes | Shipping address ID (must belong to the user and be active) |
| `notes` | string | No | Special instructions (max 500 chars) |
| `idempotencyKey` | UUID | No | Prevents duplicate orders on retry (client-generated UUID) |

**Response: `201 Created`**

Returns an [OrderResponse](#order-response-object).

**Errors:**

| Status | Description |
| --- | --- |
| `400` | Cart is empty |
| `400` | Insufficient stock for a product |
| `404` | Shipping address not found |

**What happens during checkout:**
1. Validates the cart is not empty
2. Checks stock availability for all items
3. Validates the shipping address exists and belongs to the user
4. Calculates subtotal, tax (15% VAT), and total
5. Generates a unique order number (`ORD-YYYYMMDD-XXXXXXXX`)
6. Snapshots the shipping address (saved as JSON on the order)
7. Groups items by vendor and creates sub-orders (`VendorOrder`)
8. Returns the created order (status: `PENDING`)

> **Note:** Cart and stock are unchanged at this point. They update only after payment.

---

### 2. Mock Payment

Simulates payment for a pending order. Will be replaced with real payment gateway webhooks.

```
POST /v1/orders/:id/mock-payment
```

**Path Parameters:**

| Param | Type | Description |
| --- | --- | --- |
| `id` | UUID | Order ID |

**Request Body:**

```json
{
  "success": true
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `success` | boolean | Yes | `true` for successful payment, `false` for failure |

**Response: `200 OK`**

Returns an [OrderResponse](#order-response-object).

**On success (`true`):**
- Order status changes to `PLACED`
- Payment status changes to `PAID`
- All vendor orders status changes to `PLACED`
- Stock is deducted for all items
- Cart is cleared

**On failure (`false`):**
- Payment status changes to `FAILED`
- Order stays in `PENDING` status
- Stock and cart remain unchanged

**Errors:**

| Status | Description |
| --- | --- |
| `400` | Order is not in PENDING status |
| `404` | Order not found |

---

### 3. Get My Orders (Paginated)

Retrieves the authenticated user's orders with pagination and optional filters.

```
GET /v1/orders
```

**Query Parameters:**

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer | `1` | Page number (min: 1) |
| `limit` | integer | `10` | Items per page (min: 1) |
| `status` | OrderStatus | - | Filter by order status |
| `paymentStatus` | PaymentStatus | - | Filter by payment status |

**Example:**

```
GET /v1/orders?page=1&limit=10&status=PLACED&paymentStatus=PAID
```

**Response: `200 OK`**

```json
{
  "data": [OrderResponse],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

Orders are sorted by `createdAt` descending (newest first).

---

### 4. Get Order Details

Retrieves a single order with full details.

```
GET /v1/orders/:id
```

**Path Parameters:**

| Param | Type | Description |
| --- | --- | --- |
| `id` | UUID | Order ID |

**Response: `200 OK`**

Returns an [OrderResponse](#order-response-object).

**Errors:**

| Status | Description |
| --- | --- |
| `404` | Order not found (or doesn't belong to the user) |

---

### 5. Cancel Entire Order

Cancels the entire order. Only allowed when the order status is `PENDING`, `PLACED`, or `CONFIRMED`.

```
PUT /v1/orders/:id/cancel
```

**Path Parameters:**

| Param | Type | Description |
| --- | --- | --- |
| `id` | UUID | Order ID |

**Request Body:**

```json
{
  "reason": "CHANGED_MIND",
  "details": "Found a better price elsewhere"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `reason` | CancellationReason | Yes | Reason for cancellation |
| `details` | string | No | Additional details (max 500 chars) |

**Response: `200 OK`**

Returns an [OrderResponse](#order-response-object) with updated cancelled status.

**What happens:**
- Order status changes to `CANCELLED`
- All vendor orders are cancelled
- All active items are cancelled
- If payment was `PAID`, stock is restored for all active items

**Errors:**

| Status | Description |
| --- | --- |
| `400` | Cannot cancel order with status `PACKED` / `SHIPPED` / `DELIVERED` / `CANCELLED` / `REFUNDED` |
| `404` | Order not found |

---

### 6. Cancel Individual Item

Cancels a single item within an order. Only allowed when the order status is `PENDING`, `PLACED`, or `CONFIRMED`.

```
PUT /v1/orders/:orderId/items/:itemId/cancel
```

**Path Parameters:**

| Param | Type | Description |
| --- | --- | --- |
| `orderId` | UUID | Order ID |
| `itemId` | UUID | Order item ID |

**Request Body:**

```json
{
  "reason": "NO_LONGER_NEEDED",
  "details": "Ordered wrong size"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `reason` | CancellationReason | Yes | Reason for item cancellation |
| `details` | string | No | Additional details (max 500 chars) |

**Response: `200 OK`**

Returns an [OrderResponse](#order-response-object).

**What happens:**
- The item status changes to `CANCELLED`
- If payment was `PAID`, stock is restored for the item
- If all items in a vendor order are cancelled, the vendor order auto-cancels
- If all vendor orders are cancelled, the entire order auto-cancels

**Errors:**

| Status | Description |
| --- | --- |
| `400` | Cannot cancel items for order with status `PACKED` / `SHIPPED` / `DELIVERED` |
| `400` | Item is already cancelled |
| `404` | Order not found |
| `404` | Order item not found |

---

## Response Objects

### Order Response Object

```json
{
  "id": "uuid",
  "userId": "uuid",
  "orderNumber": "ORD-20260212-A1B2C3D4",
  "status": "PLACED",
  "paymentStatus": "PAID",
  "subtotal": 150.00,
  "shippingFee": 0,
  "tax": 22.50,
  "discount": 0,
  "total": 172.50,
  "shippingAddress": {
    "firstName": "Mohammed",
    "lastName": "Ali",
    "phoneNumber": "+966501234567",
    "street": "King Fahd Road",
    "city": "Riyadh",
    "area": "Al Olaya",
    "apartmentNo": "12B",
    "directions": "Near the mall"
  },
  "trackingNumber": null,
  "notes": "Please call before delivery",
  "cancellationReason": null,
  "cancelledAt": null,
  "vendorOrders": [
    {
      "id": "uuid",
      "vendorId": "uuid",
      "vendorOrderNumber": "VORD-20260212-A1B2C3D4-001",
      "status": "PLACED",
      "subtotal": 150.00,
      "tax": 22.50,
      "total": 172.50,
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "productTitle": "Premium T-Shirt",
          "productTitleAr": "تيشيرت ممتاز",
          "sku": "TSH-BLK-L",
          "price": 75.00,
          "quantity": 2,
          "subtotal": 150.00,
          "status": "ACTIVE",
          "cancellationReason": null,
          "cancelledAt": null,
          "variantDetails": {
            "color": "Black",
            "colorAr": "أسود",
            "colorHex": "#000000",
            "size": "L",
            "sizeAr": "كبير"
          }
        }
      ],
      "createdAt": "2026-02-12T10:00:00.000Z",
      "updatedAt": "2026-02-12T10:00:00.000Z"
    }
  ],
  "createdAt": "2026-02-12T10:00:00.000Z",
  "updatedAt": "2026-02-12T10:00:00.000Z"
}
```

### Paginated Orders Response

```json
{
  "data": [OrderResponse],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

## Multi-Vendor Order Structure

A single customer order can contain products from multiple vendors. The structure is:

```
Order (customer-level)
├── VendorOrder #1 (store A)
│   ├── OrderItem (product from store A)
│   └── OrderItem (product from store A)
└── VendorOrder #2 (store B)
    └── OrderItem (product from store B)
```

- Each `VendorOrder` has its own `vendorOrderNumber` (e.g., `VORD-20260212-A1B2C3D4-001`)
- Each `VendorOrder` has its own subtotal, tax, and total
- Vendor orders can have independent statuses from the main order

---

## Idempotency

The checkout endpoint supports an optional `idempotencyKey` (UUID) to prevent duplicate orders caused by network retries or double-clicks.

**How it works:**
1. Client generates a UUID and sends it with the checkout request
2. If a request with the same key was already processed, the existing order is returned
3. The key is validated to belong to the same user

**Example:**
```
POST /v1/orders/checkout
{
  "addressId": "...",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}
```

If retried with the same `idempotencyKey`, the original order is returned instead of creating a duplicate.

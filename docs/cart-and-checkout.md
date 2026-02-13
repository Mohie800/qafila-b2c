# Cart & Checkout System

## Overview

The cart and checkout system supports both **guest** and **authenticated** users, multi-vendor order grouping, stock management, and a mock payment flow. All monetary calculations include **15% Saudi VAT**.

---

## Table of Contents

- [Cart System](#cart-system)
  - [Guest Cart](#guest-cart-endpoints)
  - [User Cart](#user-cart-endpoints)
  - [DTOs](#cart-dtos)
  - [Business Rules](#cart-business-rules)
- [Checkout & Orders](#checkout--orders)
  - [Customer Endpoints](#customer-order-endpoints)
  - [Admin Endpoints](#admin-order-endpoints)
  - [Vendor Endpoints](#vendor-order-endpoints)
  - [DTOs](#order-dtos)
  - [Checkout Flow](#checkout-flow)
  - [Payment Flow](#payment-flow)
  - [Cancellation](#cancellation)
- [Enums & Constants](#enums--constants)
- [Data Model](#data-model)

---

## Cart System

### Guest Cart Endpoints

Base path: `v1/cart/guest` — **No authentication required** (`@Public`)

| Method   | Path                        | Description           | Status |
| -------- | --------------------------- | --------------------- | ------ |
| `POST`   | `/`                         | Create a guest cart   | 201    |
| `GET`    | `/:guestId`                 | Get guest cart        | 200    |
| `GET`    | `/:guestId/count`           | Get item count        | 200    |
| `POST`   | `/:guestId/items`           | Add item to cart      | 201    |
| `PATCH`  | `/:guestId/items/:itemId`   | Update item quantity  | 200    |
| `DELETE` | `/:guestId/items/:itemId`   | Remove item from cart | 200    |
| `DELETE` | `/:guestId`                 | Clear entire cart     | 200    |

#### Create Guest Cart

```http
POST /v1/cart/guest
```

**Response** `201`

```json
{
  "guestId": "uuid",
  "cartId": "uuid",
  "expiresAt": "2025-04-01T00:00:00.000Z"
}
```

Guest carts expire after **30 days**. Expired carts are deleted automatically on access.

---

### User Cart Endpoints

Base path: `v1/cart` — **Requires authentication** (roles: `CUSTOMER`, `VENDOR`, `ADMIN`)

| Method   | Path              | Description                        | Status |
| -------- | ----------------- | ---------------------------------- | ------ |
| `GET`    | `/`               | Get authenticated user's cart      | 200    |
| `GET`    | `/count`          | Get item count                     | 200    |
| `POST`   | `/items`          | Add item to cart                   | 201    |
| `PATCH`  | `/items/:itemId`  | Update item quantity               | 200    |
| `DELETE` | `/items/:itemId`  | Remove item                        | 200    |
| `DELETE` | `/`               | Clear entire cart                  | 200    |
| `POST`   | `/merge`          | Merge a guest cart into user cart  | 200    |

#### Merge Guest Cart

When a guest user logs in, call this endpoint to merge their guest cart into their authenticated cart.

```http
POST /v1/cart/merge
```

```json
{
  "guestId": "uuid"
}
```

- Takes the **higher quantity** between guest and user cart for duplicate products (capped at available stock).
- Skips inactive/deleted products.
- Deletes the guest cart after merging.

---

### Cart DTOs

#### Add to Cart — `AddToCartDto`

```json
{
  "productId": "uuid",
  "variantId": "uuid (optional)",
  "quantity": 1
}
```

| Field       | Type   | Required | Validation     |
| ----------- | ------ | -------- | -------------- |
| `productId` | UUID   | Yes      |                |
| `variantId` | UUID   | No       |                |
| `quantity`  | number | No       | 1–100, default 1 |

#### Update Cart Item — `UpdateCartItemDto`

```json
{
  "quantity": 3
}
```

| Field      | Type   | Required | Validation |
| ---------- | ------ | -------- | ---------- |
| `quantity` | number | Yes      | 1–100      |

#### Cart Response — `CartResponseDto`

```json
{
  "id": "uuid",
  "guestId": "uuid | null",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productTitle": "Product Name",
      "productTitleAr": "اسم المنتج",
      "productSlug": "product-name",
      "productImage": "https://...",
      "variantId": "uuid | null",
      "variantDetails": { "color": "Red", "size": "M", "sku": "SKU-001" },
      "quantity": 2,
      "unitPrice": 100.00,
      "salePrice": 80.00,
      "snapshotPrice": 80.00,
      "priceChanged": false,
      "discountPercentage": 20,
      "lineTotal": 160.00,
      "availableStock": 50,
      "inStock": true,
      "exceedsStock": false,
      "addedAt": "2025-03-01T00:00:00.000Z"
    }
  ],
  "summary": {
    "itemCount": 1,
    "totalQuantity": 2,
    "subtotal": 160.00,
    "discount": 0,
    "total": 160.00,
    "taxRate": 0.15,
    "taxAmount": 20.87,
    "totalBeforeTax": 139.13,
    "hasPriceChanges": false,
    "hasOutOfStockItems": false,
    "hasStockIssues": false
  },
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

#### Cart Count — `CartCountDto`

```json
{
  "count": 3,
  "totalQuantity": 7
}
```

---

### Cart Business Rules

| Rule                    | Detail                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| Max items per cart      | **50** distinct products/variants                                     |
| Max quantity per item   | **100**                                                               |
| Guest cart expiry       | **30 days** from creation                                             |
| Pricing                 | Uses variant price > sale price > product price (in priority order)   |
| Price snapshot          | Stores the price at time of adding; flags `priceChanged` if it drifts |
| Tax calculation         | `tax = total × (0.15 / 1.15)` — VAT is extracted from the total      |
| Stock validation        | Checked on add and update; returns error if insufficient              |
| Merge strategy          | Higher quantity wins (capped at stock); inactive products skipped     |

---

## Checkout & Orders

### Customer Order Endpoints

Base path: `v1/orders` — **Requires authentication** (role: `CUSTOMER`)

| Method | Path                            | Description          | Status |
| ------ | ------------------------------- | -------------------- | ------ |
| `POST` | `/checkout`                     | Create order         | 201    |
| `POST` | `/:id/mock-payment`             | Simulate payment     | 200    |
| `GET`  | `/`                             | List my orders       | 200    |
| `GET`  | `/:id`                          | Get order details    | 200    |
| `PUT`  | `/:id/cancel`                   | Cancel entire order  | 200    |
| `PUT`  | `/:orderId/items/:itemId/cancel`| Cancel a single item | 200    |

### Admin Order Endpoints

Base path: `v1/admin/orders` — **Requires authentication** (role: `ADMIN`)

| Method | Path               | Description            | Status |
| ------ | ------------------ | ---------------------- | ------ |
| `GET`  | `/`                | List all orders        | 200    |
| `GET`  | `/:id`             | Get any order          | 200    |
| `PUT`  | `/:id/status`      | Update order status    | 200    |
| `PUT`  | `/:id/tracking`    | Add tracking number    | 200    |

### Vendor Order Endpoints

Base path: `v1/vendor/orders` — **Requires authentication** (role: `VENDOR`)

| Method | Path          | Description                  | Status |
| ------ | ------------- | ---------------------------- | ------ |
| `GET`  | `/`           | List vendor's own orders     | 200    |
| `GET`  | `/:id`        | Get vendor order details     | 200    |
| `PUT`  | `/:id/status` | Update vendor order status   | 200    |

---

### Order DTOs

#### Checkout — `CheckoutDto`

```json
{
  "addressId": "uuid",
  "notes": "Please leave at door (optional, max 500 chars)",
  "idempotencyKey": "uuid (optional, prevents duplicate orders)"
}
```

#### Mock Payment — `MockPaymentDto`

```json
{
  "success": true
}
```

#### Cancel Order — `CancelOrderDto`

```json
{
  "reason": "CHANGED_MIND",
  "details": "Optional explanation (max 500 chars)"
}
```

#### Cancel Item — `CancelItemDto`

```json
{
  "reason": "NO_LONGER_NEEDED",
  "details": "Optional explanation (max 500 chars)"
}
```

#### Update Order Status — `UpdateOrderStatusDto`

```json
{
  "status": "SHIPPED",
  "reason": "Optional reason (max 500 chars)"
}
```

#### Add Tracking — `AddTrackingDto`

```json
{
  "trackingNumber": "TRACK-123456"
}
```

Adding a tracking number automatically updates the order status to **SHIPPED**.

#### Order Query — `OrderQueryDto`

| Param           | Type          | Default | Description              |
| --------------- | ------------- | ------- | ------------------------ |
| `page`          | number        | 1       | Page number              |
| `limit`         | number        | 10      | Items per page           |
| `status`        | OrderStatus   | —       | Filter by order status   |
| `paymentStatus` | PaymentStatus | —       | Filter by payment status |

#### Order Response — `OrderResponseDto`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+966..."
  },
  "orderNumber": "ORD-20250301-A1B2C3D4",
  "status": "PLACED",
  "paymentStatus": "PAID",
  "subtotal": 320.00,
  "shippingFee": 0,
  "tax": 41.74,
  "discount": 0,
  "total": 320.00,
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+966...",
    "street": "123 Main St",
    "city": "Riyadh",
    "area": "Al Olaya",
    "apartmentNo": "4B",
    "directions": "Near the mall"
  },
  "trackingNumber": null,
  "notes": null,
  "cancellationReason": null,
  "cancelledAt": null,
  "vendorOrders": [
    {
      "id": "uuid",
      "vendorId": "uuid",
      "vendor": {
        "id": "uuid",
        "storeName": "Store",
        "storeNameAr": "متجر",
        "slug": "store",
        "logo": "https://...",
        "isVerified": true,
        "approvalStatus": "APPROVED"
      },
      "vendorOrderNumber": "VORD-20250301-A1B2C3D4-001",
      "status": "PLACED",
      "subtotal": 320.00,
      "tax": 41.74,
      "total": 320.00,
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "productTitle": "Product Name",
          "productTitleAr": "اسم المنتج",
          "sku": "SKU-001",
          "price": 160.00,
          "quantity": 2,
          "subtotal": 320.00,
          "status": "ACTIVE",
          "cancellationReason": null,
          "cancelledAt": null,
          "variantDetails": { "color": "Red", "size": "M" }
        }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### Checkout Flow

```
Customer adds items to cart
        │
        ▼
POST /v1/orders/checkout  { addressId, notes?, idempotencyKey? }
        │
        ├── Validate cart is not empty
        ├── Validate stock for all items
        ├── Validate shipping address exists & is active
        ├── Calculate subtotal, tax (15% VAT), total
        ├── Generate order number: ORD-YYYYMMDD-XXXXXXXX
        ├── Group items by vendor
        ├── Create Order (status: PENDING, paymentStatus: PENDING)
        ├── Create VendorOrder per vendor (VORD-YYYYMMDD-XXXXXXXX-NNN)
        └── Create OrderItems with snapshot data
        │
        ▼
   Order created (cart NOT cleared, stock NOT deducted)
        │
        ▼
POST /v1/orders/:id/mock-payment  { success: true }
        │
        ├── success=true:
        │     ├── Order status → PLACED
        │     ├── PaymentStatus → PAID
        │     ├── VendorOrders → PLACED
        │     ├── Stock deducted from products/variants
        │     └── Cart items deleted
        │
        └── success=false:
              ├── PaymentStatus → FAILED
              └── Order remains PENDING (can retry)
```

**Key points:**
- Stock is deducted **only after successful payment**, not at checkout.
- Cart is cleared **only after successful payment**.
- The `idempotencyKey` prevents duplicate orders if the same request is sent twice.
- All operations run inside database **transactions** for atomicity.

---

### Payment Flow

Currently uses a **mock payment** endpoint for development. The `MockPaymentDto` accepts a `success` boolean to simulate payment outcomes.

| `success` | Result                                                        |
| --------- | ------------------------------------------------------------- |
| `true`    | Order → PLACED, payment → PAID, stock deducted, cart cleared  |
| `false`   | Payment → FAILED, order stays PENDING (retryable)             |

---

### Cancellation

#### Cancel Entire Order

```http
PUT /v1/orders/:id/cancel
```

- Allowed only when order status is: `PENDING`, `PLACED`, or `CONFIRMED`.
- If the order was **paid**, stock is **restored** for all items.
- All `VendorOrder`s and `OrderItem`s are set to `CANCELLED`.

#### Cancel Single Item

```http
PUT /v1/orders/:orderId/items/:itemId/cancel
```

- Allowed only when order status is: `PENDING`, `PLACED`, or `CONFIRMED`.
- If the order was **paid**, stock is restored **only for that item**.
- **Cascading cancellation:**
  - If all items in a `VendorOrder` are cancelled → the `VendorOrder` is cancelled.
  - If all `VendorOrder`s are cancelled → the main `Order` is cancelled.

---

## Enums & Constants

### OrderStatus

| Value        | Description                    |
| ------------ | ------------------------------ |
| `PENDING`    | Created, awaiting payment      |
| `PLACED`     | Payment successful             |
| `CONFIRMED`  | Vendor/admin confirmed         |
| `PACKED`     | Items packed for shipping      |
| `SHIPPED`    | In transit                     |
| `DELIVERED`  | Delivered to customer          |
| `CANCELLED`  | Order cancelled                |
| `REFUNDED`   | Payment refunded               |

### PaymentStatus

| Value      | Description         |
| ---------- | ------------------- |
| `PENDING`  | Awaiting payment    |
| `PAID`     | Payment received    |
| `FAILED`   | Payment failed      |
| `REFUNDED` | Payment refunded    |

### CancellationReason

| Value              | Description          |
| ------------------ | -------------------- |
| `CHANGED_MIND`     | Customer changed mind |
| `NO_LONGER_NEEDED` | No longer needed     |
| `BELIEVE_FAKE`     | Believes item is fake |
| `NO_REASON`        | No reason given      |
| `OTHER`            | Other reason         |

### Constants

| Constant                  | Value  |
| ------------------------- | ------ |
| Guest cart expiry          | 30 days |
| Max items per cart          | 50     |
| Max quantity per item       | 100    |
| VAT rate                    | 15%    |
| Order number format         | `ORD-YYYYMMDD-XXXXXXXX` |
| Vendor order number format  | `VORD-YYYYMMDD-XXXXXXXX-NNN` |

---

## Data Model

```
┌──────────┐       ┌──────────┐       ┌───────────────┐
│   User   │──1:1──│   Cart   │──1:N──│   CartItem    │
└──────────┘       └──────────┘       └───────┬───────┘
     │                                        │
     │                                   N:1  │  N:1
     │                              ┌─────────┴──────────┐
     │                              │  Product / Variant  │
     │                              └─────────┬──────────┘
     │                                        │
     │1:N                                N:1  │
┌────┴─────┐       ┌─────────────┐    ┌──────┴──────┐
│  Order   │──1:N──│ VendorOrder │─N──│  OrderItem  │
└──────────┘       └──────┬──────┘    └─────────────┘
                          │
                     N:1  │
                   ┌──────┴──────┐
                   │   Vendor    │
                   └─────────────┘
```

- **User** has one **Cart** (guest carts use `guestId` instead of `userId`).
- **Cart** contains many **CartItems**, each referencing a **Product** and optional **ProductVariant**.
- **User** has many **Orders**.
- Each **Order** is split into **VendorOrders** (one per vendor).
- Each **VendorOrder** contains **OrderItems** with snapshotted product data.
- **OrderItems** reference the original **Product** and optional **ProductVariant**.

---

## Authentication & Authorization

| Controller             | Auth Required | Roles                       |
| ---------------------- | ------------- | --------------------------- |
| `GuestCartController`  | No            | Public                      |
| `UserCartController`   | Yes           | CUSTOMER, VENDOR, ADMIN     |
| `OrdersController`     | Yes           | CUSTOMER                    |
| `AdminOrdersController`| Yes           | ADMIN                       |
| `VendorOrdersController`| Yes          | VENDOR                      |

All protected endpoints use `JwtAuthGuard` + `RolesGuard`.

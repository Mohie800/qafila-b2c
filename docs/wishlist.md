# Wishlist

## Overview

A product wishlist system that allows customers to save products for later. Includes adding, removing, checking, and clearing wishlist items, with admin endpoints for viewing and managing user wishlists. Each user can add a product only once (enforced by a unique constraint).

---

## Table of Contents

- [Customer Endpoints](#customer-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [DTOs](#dtos)
  - [Add to Wishlist](#add-to-wishlist--addtowishlistdto)
  - [Wishlist Response](#wishlist-response--wishlistresponsedto)
  - [Wishlist Item](#wishlist-item--wishlistitemdto)
  - [Admin Paginated Response](#admin-paginated-response)
- [Business Rules](#business-rules)
- [Data Model](#data-model)
- [Authentication & Authorization](#authentication--authorization)

---

## Customer Endpoints

Base path: `v1/wishlist` — **Requires JWT authentication** (role: `CUSTOMER`)

| Method   | Route               | Description                        | Status |
| -------- | ------------------- | ---------------------------------- | ------ |
| `GET`    | `/`                 | Get user's wishlist                | 200    |
| `GET`    | `/count`            | Get wishlist items count           | 200    |
| `POST`   | `/`                 | Add product to wishlist            | 201    |
| `DELETE` | `/:productId`       | Remove product from wishlist       | 204    |
| `DELETE` | `/`                 | Clear entire wishlist              | 204    |
| `GET`    | `/check/:productId` | Check if product is in wishlist    | 200    |

### Get Wishlist

```
GET /v1/wishlist
```

Returns all wishlist items with full product details, ordered by most recently added.

**Response:** `WishlistResponseDto` (see [below](#wishlist-response--wishlistresponsedto))

### Get Wishlist Count

```
GET /v1/wishlist/count
```

**Response:**

```json
{
  "count": 5
}
```

### Add Product to Wishlist

```
POST /v1/wishlist
```

**Request Body:** `AddToWishlistDto`

```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Error Responses:**

| Status | Description                    |
| ------ | ------------------------------ |
| 400    | Invalid input data             |
| 404    | Product not found              |
| 409    | Product already in wishlist    |

### Remove Product from Wishlist

```
DELETE /v1/wishlist/:productId
```

| Param       | Type | Description  |
| ----------- | ---- | ------------ |
| `productId` | UUID | Product UUID |

Returns `204 No Content` on success. Returns `404` if the product is not in the wishlist.

### Clear Entire Wishlist

```
DELETE /v1/wishlist
```

Removes all items from the user's wishlist. Returns `204 No Content`.

### Check if Product is in Wishlist

```
GET /v1/wishlist/check/:productId
```

| Param       | Type | Description  |
| ----------- | ---- | ------------ |
| `productId` | UUID | Product UUID |

**Response:**

```json
{
  "inWishlist": true
}
```

---

## Admin Endpoints

Base path: `v1/wishlist/admin` — **Requires JWT authentication** (role: `ADMIN`)

| Method   | Route            | Description                         | Status |
| -------- | ---------------- | ----------------------------------- | ------ |
| `GET`    | `/all`           | Get all wishlists with pagination   | 200    |
| `GET`    | `/user/:userId`  | Get wishlist for a specific user    | 200    |
| `DELETE` | `/user/:userId`  | Clear wishlist for a specific user  | 200    |

### Get All Wishlists (Paginated)

```
GET /v1/wishlist/admin/all?page=1&limit=20&userId=uuid&productId=uuid
```

| Param       | Type   | Default | Description          |
| ----------- | ------ | ------- | -------------------- |
| `page`      | number | 1       | Page number          |
| `limit`     | number | 20      | Items per page       |
| `userId`    | UUID   | —       | Filter by user ID    |
| `productId` | UUID   | —       | Filter by product ID |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "phoneNumber": "+1234567890",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "productId": "uuid",
      "product": {
        "title": "Product Name",
        "titleAr": "اسم المنتج",
        "slug": "product-name",
        "price": 99.99,
        "salePrice": 79.99,
        "discountPercentage": 20,
        "inStock": true
      },
      "createdAt": "2025-03-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Get Specific User's Wishlist

```
GET /v1/wishlist/admin/user/:userId
```

Returns the same shape as the customer `GET /v1/wishlist` endpoint (`WishlistResponseDto`).

### Clear Specific User's Wishlist

```
DELETE /v1/wishlist/admin/user/:userId
```

**Response:**

```json
{
  "message": "User wishlist cleared successfully"
}
```

---

## DTOs

### Add to Wishlist — `AddToWishlistDto`

```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000"
}
```

| Field       | Type | Required | Validation |
| ----------- | ---- | -------- | ---------- |
| `productId` | UUID | Yes      | Valid UUIDv4, product must exist |

### Wishlist Response — `WishlistResponseDto`

```json
{
  "items": [ /* WishlistItemDto[] */ ],
  "total": 5
}
```

| Field   | Type              | Description                |
| ------- | ----------------- | -------------------------- |
| `items` | WishlistItemDto[] | List of wishlist items     |
| `total` | number            | Total items in wishlist    |

### Wishlist Item — `WishlistItemDto`

```json
{
  "id": "uuid",
  "productId": "uuid",
  "productTitle": "Product Name",
  "productTitleAr": "اسم المنتج",
  "productDescription": "Product description...",
  "productDescriptionAr": "وصف المنتج...",
  "productCategory": "Electronics",
  "productBrand": "BrandName",
  "productPrice": 99.99,
  "productSalePrice": 79.99,
  "discountPercentage": 20,
  "productImage": "https://example.com/image.jpg",
  "productSlug": "product-name",
  "inStock": true,
  "addedAt": "2025-03-01T00:00:00.000Z"
}
```

| Field                  | Type    | Nullable | Description                         |
| ---------------------- | ------- | -------- | ----------------------------------- |
| `id`                   | string  | No       | Wishlist item ID                    |
| `productId`            | string  | No       | Product ID                          |
| `productTitle`         | string  | No       | Product title                       |
| `productTitleAr`       | string  | Yes      | Product title in Arabic             |
| `productDescription`   | string  | Yes      | Product description                 |
| `productDescriptionAr` | string  | Yes      | Product description in Arabic       |
| `productCategory`      | string  | Yes      | Category name                       |
| `productBrand`         | string  | Yes      | Brand name                          |
| `productPrice`         | number  | No       | Product price                       |
| `productSalePrice`     | number  | Yes      | Sale price (if on sale)             |
| `discountPercentage`   | number  | Yes      | Calculated discount percentage      |
| `productImage`         | string  | Yes      | Default product image URL           |
| `productSlug`          | string  | No       | Product slug                        |
| `inStock`              | boolean | No       | Whether product is in stock         |
| `addedAt`              | Date    | No       | When the item was added to wishlist |

`discountPercentage` is computed as `round(((price - salePrice) / price) * 100)` when a sale price exists and is lower than the regular price.

---

## Business Rules

| Rule                              | Detail                                                             |
| --------------------------------- | ------------------------------------------------------------------ |
| One product per user              | Enforced by unique constraint on (`userId`, `productId`)           |
| Product must exist                | Adding a non-existent product returns `404`                        |
| Duplicate prevention              | Adding an already-wishlisted product returns `409`                 |
| Cascade delete (user)             | Deleting a user removes all their wishlist items                   |
| Cascade delete (product)          | Deleting a product removes it from all wishlists                   |
| Sorted by newest                  | Wishlist items are returned ordered by `createdAt DESC`            |
| Product details included          | Wishlist responses include category, brand, default image, pricing |

---

## Data Model

```
┌──────────┐         ┌────────────┐         ┌───────────┐
│   User   │──1:N───▶│  Wishlist  │◀───N:1──│  Product  │
└──────────┘         └────────────┘         └───────────┘
```

### Prisma Schema

```prisma
model Wishlist {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  productId String   @map("product_id")
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@index([userId])
  @@index([productId])
  @@index([createdAt])
  @@map("wishlists")
}
```

### Indexes

| Index                      | Purpose                                |
| -------------------------- | -------------------------------------- |
| `userId`                   | Fast lookup of a user's wishlist       |
| `productId`                | Fast lookup of who wishlisted a product|
| `createdAt`                | Efficient ordering by date added       |
| `userId` + `productId` (unique) | Prevent duplicate entries         |

---

## Authentication & Authorization

| Endpoint Group | Auth Required | Roles      |
| -------------- | ------------- | ---------- |
| Customer       | Yes           | `CUSTOMER` |
| Admin          | Yes           | `ADMIN`    |

All endpoints use `JwtAuthGuard` + `RolesGuard`.

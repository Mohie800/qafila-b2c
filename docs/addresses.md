# Addresses System

## Overview

A complete address management system for customers with support for multiple addresses per user, default address handling, GPS coordinates, address types, soft deletes, and admin management. Addresses are snapshotted into orders at checkout time.

---

## Table of Contents

- [Customer Endpoints](#customer-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [DTOs](#dtos)
  - [Create Address](#create-address--createaddressdto)
  - [Update Address](#update-address--updateaddressdto)
  - [Responses](#response-shapes)
- [Default Address Logic](#default-address-logic)
- [Soft Delete Behavior](#soft-delete-behavior)
- [Order Integration](#order-integration)
- [Business Rules](#business-rules)
- [Data Model](#data-model)
- [Authentication & Authorization](#authentication--authorization)

---

## Customer Endpoints

Base path: `v1/addresses` — **Requires authentication** (role: `CUSTOMER`)

| Method | Route              | Description            | Status |
| ------ | ------------------ | ---------------------- | ------ |
| `GET`  | `/`                | Get all user addresses | 200    |
| `GET`  | `/default`         | Get default address    | 200    |
| `GET`  | `/:id`             | Get address by ID      | 200    |
| `POST` | `/`                | Create new address     | 201    |
| `PUT`  | `/:id`             | Update address         | 200    |
| `DELETE`| `/:id`            | Soft delete address    | 200    |
| `PUT`  | `/:id/set-default` | Set as default address | 200    |

---

## Admin Endpoints

Base path: `v1/addresses/admin` — **Requires authentication** (role: `ADMIN`)

| Method  | Route             | Description                       | Status |
| ------- | ----------------- | --------------------------------- | ------ |
| `GET`   | `/all`            | List all addresses (paginated)    | 200    |
| `GET`   | `/user/:userId`   | Get addresses for a specific user | 200    |
| `GET`   | `/:id`            | Get any address with user info    | 200    |
| `PUT`   | `/:id`            | Update any address                | 200    |
| `DELETE` | `/:id`           | Hard delete address permanently   | 200    |

### Admin Query Parameters

```
GET /v1/addresses/admin/all?page=1&limit=20&userId=uuid&isDefault=true
```

| Param       | Type    | Default | Description                |
| ----------- | ------- | ------- | -------------------------- |
| `page`      | number  | 1       | Page number                |
| `limit`     | number  | 20      | Items per page             |
| `userId`    | UUID    | —       | Filter by user             |
| `isDefault` | boolean | —       | Filter by default status   |

Admin responses include user info: `{ id, email, firstName, lastName, phoneNumber }`.

---

## DTOs

### Create Address — `CreateAddressDto`

```json
{
  "type": "HOME",
  "firstName": "Salem",
  "lastName": "Abdullah",
  "phoneNumber": "+966534562",
  "street": "King Fahd Road, Al Olaya District",
  "city": "Riyadh",
  "area": "Al Olaya",
  "apartmentNo": "Building 5, Apt 301",
  "directions": "Near the main entrance",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "isDefault": false
}
```

| Field         | Type        | Required | Description                        |
| ------------- | ----------- | -------- | ---------------------------------- |
| `type`        | AddressType | No       | `HOME` (default), `WORK`, `OTHER`  |
| `firstName`   | string      | Yes      | Recipient first name               |
| `lastName`    | string      | Yes      | Recipient last name                |
| `phoneNumber` | string      | Yes      | Recipient phone number             |
| `street`      | string      | Yes      | Full street address                |
| `city`        | string      | Yes      | City name                          |
| `area`        | string      | Yes      | Area / neighborhood                |
| `apartmentNo` | string      | No       | Apartment, villa, or building no.  |
| `directions`  | string      | No       | Delivery directions                |
| `latitude`    | number      | No       | GPS latitude (precision: 10,8)     |
| `longitude`   | number      | No       | GPS longitude (precision: 11,8)    |
| `isDefault`   | boolean     | No       | Set as default address             |

### Update Address — `UpdateAddressDto`

Extends `CreateAddressDto` with all fields optional (`PartialType`). Only provided fields are updated.

```json
{
  "phoneNumber": "+966501234567",
  "isDefault": true
}
```

---

## Response Shapes

### Address Response — `AddressResponseDto`

```json
{
  "id": "uuid",
  "type": "HOME",
  "firstName": "Salem",
  "lastName": "Abdullah",
  "phoneNumber": "+966534562",
  "street": "King Fahd Road, Al Olaya District",
  "city": "Riyadh",
  "area": "Al Olaya",
  "apartmentNo": "Building 5, Apt 301",
  "directions": "Near the main entrance",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "isDefault": true,
  "isActive": true,
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

### Address List Response — `AddressListResponseDto`

```json
{
  "addresses": [ /* AddressResponseDto[] */ ],
  "total": 3,
  "defaultAddress": { /* AddressResponseDto or null */ }
}
```

Addresses are ordered: **default first**, then by **creation date (newest first)**. Only active addresses are returned.

### Admin Paginated Response

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "HOME",
      "firstName": "Salem",
      "lastName": "Abdullah",
      "...": "...",
      "user": {
        "id": "uuid",
        "email": "salem@example.com",
        "firstName": "Salem",
        "lastName": "Abdullah",
        "phoneNumber": "+966534562"
      }
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

---

## Default Address Logic

The system ensures **exactly one default address** per user at all times.

```
User creates first address
        │
        ▼
   Automatically set as default (regardless of isDefault value)
        │
        ▼
User creates more addresses with isDefault=true
        │
        ▼
   Previous default is unset, new address becomes default
        │
        ▼
User deletes the default address
        │
        ▼
   Next most recent address automatically becomes the new default
```

| Scenario                          | Behavior                                           |
| --------------------------------- | -------------------------------------------------- |
| First address created             | Auto-set as default                                |
| New address with `isDefault=true` | Unsets all other defaults, sets this one            |
| Update with `isDefault=true`      | Unsets all other defaults, sets this one            |
| Default address deleted           | Most recent remaining address becomes default      |
| `PUT /:id/set-default`            | Explicitly sets a specific address as default      |
| No addresses remain               | No default (returns `null` on `/default` endpoint) |

---

## Soft Delete Behavior

| Action               | What Happens                                              |
| -------------------- | --------------------------------------------------------- |
| Customer `DELETE`     | Sets `isActive=false` — address hidden but retained in DB |
| Admin `DELETE`        | **Hard delete** — permanently removed from DB             |
| Customer `GET` list   | Only returns `isActive=true` addresses                   |
| Admin `GET` list      | Returns all addresses including inactive                 |

When a soft-deleted address was the default, the system automatically promotes the next most recent active address.

---

## Order Integration

Addresses are used during checkout. The address data is **snapshotted as JSON** into the order — it is not a foreign key reference. This preserves the address at the time of purchase even if the user later modifies or deletes it.

### Checkout Flow

```
POST /v1/orders/checkout
{
  "addressId": "uuid"     ← references an Address record
}
```

1. Validates that the address **exists**, **belongs to the user**, and is **active**.
2. Extracts address fields and stores them as a JSON snapshot in `Order.shippingAddress`.

### Snapshotted Fields

```json
{
  "firstName": "Salem",
  "lastName": "Abdullah",
  "phoneNumber": "+966534562",
  "street": "King Fahd Road, Al Olaya District",
  "city": "Riyadh",
  "area": "Al Olaya",
  "apartmentNo": "Building 5, Apt 301",
  "directions": "Near the main entrance"
}
```

The snapshot is immutable — editing or deleting the original address does not affect existing orders.

---

## Business Rules

| Rule                          | Detail                                                     |
| ----------------------------- | ---------------------------------------------------------- |
| Multiple addresses per user   | No limit on number of addresses                            |
| One default per user          | Enforced by service logic on create/update/delete          |
| First address auto-default    | First address always becomes default                       |
| Default fallback on delete    | Most recent active address promoted automatically          |
| Soft delete for customers     | `isActive=false`, data retained                            |
| Hard delete for admins        | Permanent removal from database                            |
| Ownership enforcement         | Customers can only access their own addresses              |
| GPS coordinates optional      | Stored as high-precision decimals (lat: 10,8 / lng: 11,8) |
| Address type defaults to HOME | If not specified, `type` is `HOME`                         |
| Cascade on user delete        | All addresses deleted when user account is deleted         |

---

## Address Types

| Type    | Description          |
| ------- | -------------------- |
| `HOME`  | Residential (default)|
| `WORK`  | Business / workplace |
| `OTHER` | Any other location   |

---

## Data Model

```
┌──────────┐       ┌─────────────┐
│   User   │──1:N──│   Address   │
└──────────┘       └──────┬──────┘
                          │
                     snapshotted
                     at checkout
                          │
                          ▼
                   ┌─────────────┐
                   │    Order    │
                   │ shipping-   │
                   │ Address JSON│
                   └─────────────┘
```

### Address Entity

| Column        | Type           | Nullable | Description                  |
| ------------- | -------------- | -------- | ---------------------------- |
| `id`          | UUID (PK)      | No       | Primary key                  |
| `userId`      | UUID (FK)      | No       | References User              |
| `type`        | AddressType    | No       | HOME, WORK, OTHER            |
| `firstName`   | String         | No       | Recipient first name         |
| `lastName`    | String         | No       | Recipient last name          |
| `phoneNumber` | String         | No       | Recipient phone              |
| `street`      | String         | No       | Street address               |
| `city`        | String         | No       | City                         |
| `area`        | String         | No       | Area / neighborhood          |
| `apartmentNo` | String         | Yes      | Apartment / villa number     |
| `directions`  | String         | Yes      | Delivery directions          |
| `latitude`    | Decimal(10,8)  | Yes      | GPS latitude                 |
| `longitude`   | Decimal(11,8)  | Yes      | GPS longitude                |
| `isDefault`   | Boolean        | No       | Default address flag         |
| `isActive`    | Boolean        | No       | Soft delete flag             |
| `createdAt`   | DateTime       | No       | Creation timestamp           |
| `updatedAt`   | DateTime       | No       | Last update timestamp        |

### Database Indexes

| Index        | Purpose                         |
| ------------ | ------------------------------- |
| `userId`     | Fast lookup of user's addresses |
| `isDefault`  | Quick default address queries   |
| `isActive`   | Efficient active/inactive filtering |

---

## Authentication & Authorization

| Endpoint Group    | Auth Required | Roles    |
| ----------------- | ------------- | -------- |
| Customer CRUD     | Yes           | CUSTOMER |
| Admin management  | Yes           | ADMIN    |

All endpoints use `JwtAuthGuard` + `RolesGuard`. Customers can only access their own addresses. Admins can access and manage all addresses.

### Error Responses

| Scenario                         | Exception              |
| -------------------------------- | ---------------------- |
| Address not found or not owned   | `NotFoundException`    |
| Accessing inactive address       | `NotFoundException`    |
| Missing/invalid JWT token        | `UnauthorizedException`|
| Wrong user role                  | `ForbiddenException`   |
| Invalid input data               | `BadRequestException`  |

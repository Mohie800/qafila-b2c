# Reviews System

## Overview

A full-featured product review system with star ratings, image attachments, likes (helpful votes), nested comments, vendor-specific views, and admin moderation. Rating aggregations are cached on products for performance.

---

## Table of Contents

- [Public Endpoints](#public-endpoints)
- [Authenticated User Endpoints](#authenticated-user-endpoints)
- [Vendor Endpoints](#vendor-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [DTOs](#dtos)
  - [Create Review](#create-review--createreviewdto)
  - [Update Review](#update-review--updatereviewdto)
  - [Query & Filters](#query--filters--reviewquerydto)
  - [Comments](#comments)
  - [Responses](#response-shapes)
- [Review Lifecycle](#review-lifecycle)
- [Likes System](#likes-system)
- [Comments & Replies](#comments--replies)
- [Image Management](#image-management)
- [Rating Aggregation & Stats](#rating-aggregation--stats)
- [Moderation & Approval](#moderation--approval)
- [Business Rules](#business-rules)
- [Data Model](#data-model)
- [Authentication & Authorization](#authentication--authorization)

---

## Public Endpoints

Base path: `v1/reviews` — **No authentication required** (`@Public`)

| Method | Route                                  | Description                  | Status |
| ------ | -------------------------------------- | ---------------------------- | ------ |
| `GET`  | `/`                                    | List reviews (filtered)      | 200    |
| `GET`  | `/product/:productId`                  | Get reviews for a product    | 200    |
| `GET`  | `/product/:productId/stats`            | Get product review stats     | 200    |
| `GET`  | `/:id`                                 | Get single review            | 200    |
| `GET`  | `/:id/comments`                        | Get comments on a review     | 200    |

---

## Authenticated User Endpoints

Base path: `v1/reviews` — **Requires JWT authentication**

### Reviews

| Method   | Route                 | Description                    | Status |
| -------- | --------------------- | ------------------------------ | ------ |
| `POST`   | `/`                   | Create a review                | 201    |
| `POST`   | `/with-images`        | Create review with image upload| 201    |
| `PUT`    | `/:id`                | Update own review              | 200    |
| `DELETE` | `/:id`                | Delete own review              | 200    |
| `GET`    | `/user/my-reviews`    | Get current user's reviews     | 200    |

### Likes

| Method | Route                | Description              | Status |
| ------ | -------------------- | ------------------------ | ------ |
| `POST` | `/:id/like`          | Toggle like on a review  | 200    |
| `GET`  | `/:id/like/status`   | Check if user liked      | 200    |

### Comments

| Method   | Route                       | Description           | Status |
| -------- | --------------------------- | --------------------- | ------ |
| `POST`   | `/:id/comments`             | Add comment to review | 201    |
| `PUT`    | `/comments/:commentId`      | Update own comment    | 200    |
| `DELETE` | `/comments/:commentId`      | Delete own comment    | 200    |

### Images

| Method   | Route                    | Description                    | Status |
| -------- | ------------------------ | ------------------------------ | ------ |
| `POST`   | `/:id/images`            | Add image to own review        | 201    |
| `DELETE` | `/images/:imageId`       | Delete image from own review   | 200    |

---

## Vendor Endpoints

Base path: `v1/reviews/vendor` — **Requires authentication** (role: `VENDOR`)

| Method | Route        | Description                          | Status |
| ------ | ------------ | ------------------------------------ | ------ |
| `GET`  | `/products`  | Get all reviews for vendor's products| 200    |

Vendors only see reviews written on their own products. Supports all standard filters and sorting.

---

## Admin Endpoints

Base path: `v1/reviews/admin` — **Requires authentication** (role: `ADMIN`)

| Method   | Route                       | Description                | Status |
| -------- | --------------------------- | -------------------------- | ------ |
| `GET`    | `/all`                      | List all reviews (extended)| 200    |
| `PUT`    | `/:id`                      | Update any review          | 200    |
| `DELETE` | `/:id`                      | Delete any review          | 200    |
| `PUT`    | `/comments/:commentId`      | Update any comment         | 200    |
| `DELETE` | `/comments/:commentId`      | Delete any comment         | 200    |
| `DELETE` | `/images/:imageId`          | Delete any image           | 200    |

---

## DTOs

### Create Review — `CreateReviewDto`

```json
{
  "productId": "uuid",
  "rating": 5,
  "title": "Great product! (optional, 3-200 chars)",
  "content": "Detailed review text (optional, 10-5000 chars)",
  "images": [
    {
      "url": "https://...",
      "alt": "Photo description (optional, max 255)",
      "sortOrder": 0
    }
  ]
}
```

| Field       | Type             | Required | Validation                |
| ----------- | ---------------- | -------- | ------------------------- |
| `productId` | UUID             | Yes      | Must exist                |
| `rating`    | number           | Yes      | 1–5                       |
| `title`     | string           | No       | 3–200 chars               |
| `content`   | string           | No       | 10–5000 chars             |
| `images`    | ReviewImageDto[] | No       | Max 10 items              |

### Update Review — `UpdateReviewDto`

All fields are optional:

```json
{
  "rating": 4,
  "title": "Updated title",
  "content": "Updated review text",
  "images": [{ "url": "https://...", "alt": "New photo" }]
}
```

If `images` is provided, it **replaces all existing images** on the review.

### Admin Update Review — `AdminUpdateReviewDto`

Extends `UpdateReviewDto` with moderation fields:

```json
{
  "rating": 4,
  "title": "...",
  "content": "...",
  "isApproved": true,
  "isActive": true,
  "isVerifiedPurchase": true
}
```

| Field                | Type    | Description                         |
| -------------------- | ------- | ----------------------------------- |
| `isApproved`         | boolean | Show/hide from public queries       |
| `isActive`           | boolean | Soft-delete toggle                  |
| `isVerifiedPurchase` | boolean | Mark as verified buyer              |

### Query & Filters — `ReviewQueryDto`

All fields are optional query parameters.

```
GET /v1/reviews?productId=uuid&minRating=4&verifiedOnly=true&sortBy=helpfulCount&page=1&limit=10
```

| Param            | Type    | Default     | Description                          |
| ---------------- | ------- | ----------- | ------------------------------------ |
| `productId`      | UUID    | —           | Filter by product                    |
| `userId`         | UUID    | —           | Filter by reviewer                   |
| `minRating`      | number  | —           | Minimum star rating (1–5)            |
| `maxRating`      | number  | —           | Maximum star rating (1–5)            |
| `verifiedOnly`   | boolean | —           | Only verified purchases              |
| `withImagesOnly` | boolean | —           | Only reviews with images             |
| `sortBy`         | enum    | `createdAt` | `createdAt`, `rating`, `helpfulCount`|
| `sortOrder`      | enum    | `desc`      | `asc` or `desc`                      |
| `page`           | number  | 1           | Page number                          |
| `limit`          | number  | 10          | Items per page (1–100)               |

### Admin Query — `AdminReviewQueryDto`

Extends `ReviewQueryDto` with:

| Param        | Type    | Description                    |
| ------------ | ------- | ------------------------------ |
| `isApproved` | boolean | Filter by approval status      |
| `isActive`   | boolean | Filter by active status        |

### Comments

#### Create Comment — `CreateReviewCommentDto`

```json
{
  "content": "Great review, very helpful! (2-2000 chars)",
  "parentId": "uuid (optional, for nested replies)"
}
```

#### Update Comment — `UpdateReviewCommentDto`

```json
{
  "content": "Updated comment text (2-2000 chars)"
}
```

#### Admin Update Comment — `AdminUpdateReviewCommentDto`

```json
{
  "content": "...",
  "isApproved": true,
  "isActive": true
}
```

---

## Response Shapes

### Review Response — `ReviewResponseDto`

```json
{
  "id": "uuid",
  "productId": "uuid",
  "rating": 5,
  "title": "Amazing quality!",
  "content": "The product exceeded my expectations...",
  "isVerifiedPurchase": true,
  "helpfulCount": 12,
  "hasLiked": false,
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "images": [
    {
      "id": "uuid",
      "url": "https://...",
      "alt": "Product photo",
      "sortOrder": 0
    }
  ],
  "commentCount": 3,
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

`hasLiked` is relative to the currently authenticated user (`false` for anonymous).

### Paginated Reviews — `PaginatedReviewsDto`

```json
{
  "data": [ /* ReviewResponseDto[] */ ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 10,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Review Stats — `ReviewStatsDto`

```json
{
  "averageRating": 4.3,
  "totalReviews": 156,
  "ratingDistribution": {
    "5": 78,
    "4": 42,
    "3": 20,
    "2": 10,
    "1": 6
  },
  "verifiedPurchasePercentage": 68.5,
  "reviewsWithImages": 45
}
```

Only **active and approved** reviews are counted in statistics.

### Comment Response — `ReviewCommentResponseDto`

```json
{
  "id": "uuid",
  "reviewId": "uuid",
  "content": "Very helpful review!",
  "user": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "replies": [
    {
      "id": "uuid",
      "content": "Thanks!",
      "user": { "id": "uuid", "firstName": "John", "lastName": "Doe" },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

---

## Review Lifecycle

```
User purchases product
        │
        ▼
POST /v1/reviews  { productId, rating, title?, content?, images? }
        │
        ├── Validate product exists
        ├── Check one-review-per-user-per-product constraint
        ├── Create review (isApproved=true, isActive=true)
        ├── Create images (if provided)
        └── Recalculate product averageRating & reviewCount
        │
        ▼
   Review is live and visible publicly
        │
        ├── Owner can UPDATE (rating, title, content, images)
        │     └── Product stats recalculated if rating changed
        │
        ├── Owner can DELETE
        │     └── Product stats recalculated
        │
        └── Admin can MODERATE
              ├── Set isApproved=false → hidden from public
              ├── Set isActive=false → soft-deleted
              └── Set isVerifiedPurchase=true/false
```

---

## Likes System

Users can mark reviews as "helpful" by toggling a like.

```
POST /v1/reviews/:id/like
```

**Response:**

```json
{
  "liked": true,
  "helpfulCount": 13
}
```

| Rule                              | Detail                                       |
| --------------------------------- | -------------------------------------------- |
| Toggle behavior                   | Calling again removes the like               |
| Self-like prevention              | Users cannot like their own reviews          |
| Cached count                      | `helpfulCount` is stored on the review       |
| One like per user per review      | Enforced by unique constraint                |

The `hasLiked` field in review responses indicates whether the current user has liked each review.

---

## Comments & Replies

### Structure

Comments support **one level of nesting** via the `parentId` field:

```
Review
  └── Comment (top-level, parentId = null)
        ├── Reply (parentId = comment.id)
        ├── Reply
        └── Reply
```

### Fetching Comments

```
GET /v1/reviews/:id/comments?page=1&limit=10
```

- Returns **top-level comments only** (where `parentId` is null).
- Each comment includes its `replies` array.
- Top-level comments ordered by `createdAt DESC` (newest first).
- Replies ordered by `createdAt ASC` (oldest first).
- Only active and approved comments are returned publicly.

### Authorization

| Action         | Who can do it                    |
| -------------- | -------------------------------- |
| Create comment | Any authenticated user           |
| Update comment | Comment owner only               |
| Delete comment | Comment owner or admin           |

Deleting a parent comment **cascades** to all its replies.

---

## Image Management

### Upload with Review Creation

```
POST /v1/reviews/with-images
Content-Type: multipart/form-data
```

Uses `FilesInterceptor` for multipart file uploads. Images are filtered to allow only image file types.

### Add Image to Existing Review

```
POST /v1/reviews/:id/images
Content-Type: multipart/form-data
```

Only the review owner can add images. Max **10 images** per review.

### Delete Image

```
DELETE /v1/reviews/images/:imageId
```

Deletes the image file from disk and the database record. Only the review owner or an admin can delete.

### Image Data Shape

```json
{
  "id": "uuid",
  "url": "https://...",
  "alt": "Description",
  "sortOrder": 0
}
```

---

## Rating Aggregation & Stats

### Cached Product Fields

Every time a review is created, updated, or deleted, two fields on the `Product` model are recalculated:

| Field           | Type    | Description                                |
| --------------- | ------- | ------------------------------------------ |
| `averageRating` | Decimal | Average of all active+approved ratings     |
| `reviewCount`   | Int     | Count of all active+approved reviews       |

Only reviews with `isActive=true` AND `isApproved=true` are included in the aggregation.

### Stats Endpoint

```
GET /v1/reviews/product/:productId/stats
```

Returns a `ReviewStatsDto` with:

- **averageRating** — rounded to 1 decimal place
- **totalReviews** — count of active+approved reviews
- **ratingDistribution** — breakdown by star (1–5)
- **verifiedPurchasePercentage** — percentage of verified buyer reviews
- **reviewsWithImages** — count of reviews that have at least one image

---

## Moderation & Approval

### Default Behavior

- New reviews are created with `isApproved=true` (no pre-moderation queue).
- New comments are created with `isApproved=true`.

### Admin Controls

| Field        | Effect when `false`                                    |
| ------------ | ------------------------------------------------------ |
| `isApproved` | Hidden from all public queries and stats               |
| `isActive`   | Soft-deleted — hidden from all public queries and stats|

Admins can toggle these on any review or comment via:

```
PUT /v1/reviews/admin/:id
PUT /v1/reviews/admin/comments/:commentId
```

Changes to approval or active status trigger a **product rating recalculation**.

---

## Business Rules

| Rule                           | Detail                                                      |
| ------------------------------ | ----------------------------------------------------------- |
| One review per user per product| Enforced by unique constraint (`productId` + `userId`)      |
| Rating range                   | 1–5 (integer)                                               |
| Title length                   | 3–200 characters (optional)                                 |
| Content length                 | 10–5000 characters (optional)                               |
| Max images per review          | 10                                                          |
| Comment length                 | 2–2000 characters                                           |
| Self-like prevention           | Users cannot like their own reviews                         |
| One like per user per review   | Enforced by unique constraint                               |
| Owner-only edits               | Only the review/comment owner can update or delete          |
| Admin override                 | Admins can update/delete any review, comment, or image      |
| Stats scope                    | Only `isActive=true` AND `isApproved=true` reviews counted  |
| Transaction safety             | Create, update, delete, and like operations use transactions|

---

## Data Model

```
┌──────────┐         ┌────────────┐
│   User   │──1:N───▶│   Review   │
└──────────┘         └─────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         1:N  ▼       1:N  ▼       1:N  ▼
    ┌─────────────┐ ┌───────────┐ ┌──────────────┐
    │ ReviewImage │ │ ReviewLike│ │ReviewComment │
    └─────────────┘ └───────────┘ └──────┬───────┘
                                         │
                                    self-ref
                                    (replies)

┌───────────┐         ┌────────────┐
│  Product  │──1:N───▶│   Review   │
│           │         └────────────┘
│ avgRating │ (cached)
│ reviewCnt │ (cached)
└───────────┘
```

### Entity Details

| Entity          | Key Fields                                                          |
| --------------- | ------------------------------------------------------------------- |
| **Review**      | id, productId, userId, rating, title, content, isVerifiedPurchase, isApproved, isActive, helpfulCount |
| **ReviewImage** | id, reviewId, url, alt, sortOrder                                   |
| **ReviewLike**  | id, reviewId, userId (unique: reviewId+userId)                      |
| **ReviewComment** | id, reviewId, userId, parentId (nullable), content, isApproved, isActive |

### Constraints

- `Review`: unique on (`productId`, `userId`) — one review per user per product
- `ReviewLike`: unique on (`reviewId`, `userId`) — one like per user per review
- `ReviewImage`, `ReviewLike`, `ReviewComment`: cascade delete when parent review is deleted
- `ReviewComment` replies: cascade delete when parent comment is deleted

---

## Authentication & Authorization

| Endpoint Group     | Auth Required | Roles                   |
| ------------------ | ------------- | ----------------------- |
| Public (list/view) | No            | Anyone                  |
| User (CRUD/like)   | Yes           | Any authenticated user  |
| Vendor             | Yes           | VENDOR                  |
| Admin              | Yes           | ADMIN                   |

All protected endpoints use `JwtAuthGuard` + `RolesGuard`.

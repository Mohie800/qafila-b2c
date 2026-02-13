# Stories Feature

Instagram-style stories feature for vendors to share ephemeral 24-hour content with customers.

## Overview

Vendors can publish stories (images or videos) that expire after 24 hours. Customers can view stories from:

- Specific vendor pages
- Vendors they follow (personalized feed)
- All vendors (explore feed)

## Database Schema

### VendorStory

- **id**: UUID
- **vendorId**: Reference to vendor
- **mediaUrl**: URL to uploaded media file
- **mediaType**: IMAGE or VIDEO
- **caption**: Optional caption (English)
- **captionAr**: Optional caption (Arabic)
- **linkType**: NONE, PRODUCT, CATEGORY, or EXTERNAL
- **linkId**: ID of linked product/category (if applicable)
- **linkUrl**: External URL (if linkType is EXTERNAL)
- **isActive**: Boolean flag
- **expiresAt**: Timestamp (24 hours from creation)
- **viewCount**: Cached view count
- **likeCount**: Cached like count
- **createdAt**: Creation timestamp
- **updatedAt**: Update timestamp

### StoryLike

- **id**: UUID
- **storyId**: Reference to story
- **userId**: Reference to user who liked
- **createdAt**: Creation timestamp
- Unique constraint: (storyId, userId) - one like per user per story

### StoryComment

- **id**: UUID
- **storyId**: Reference to story
- **userId**: Reference to user who commented
- **parentId**: Optional reference to parent comment (for nested replies)
- **content**: Comment text
- **isActive**: Boolean flag
- **createdAt**: Creation timestamp
- **updatedAt**: Update timestamp
- Self-relation: parent/replies for nested comment threads
- Cascade delete from story, user, and parent comment

### StoryView

- **id**: UUID
- **storyId**: Reference to story
- **userId**: Reference to user who viewed
- **viewedAt**: View timestamp
- Unique constraint: (storyId, userId) - one view per user per story

## API Endpoints

### Vendor Endpoints

#### Create Story

```
POST /v1/stories
Authorization: Bearer {token}
Role: VENDOR
Body: CreateStoryDto
```

**Responses**

- **201 Created**
  - Body: `StoryResponseDto`
- **400 Bad Request** (validation errors)
- **401 Unauthorized**
- **403 Forbidden** (non-vendor)

#### Get Own Stories

```
GET /v1/stories/my-stories
Authorization: Bearer {token}
Role: VENDOR
```

**Responses**

- **200 OK**
  - Body: `StoryResponseDto[]`
- **401 Unauthorized**
- **403 Forbidden** (non-vendor)

#### Delete Story

```
DELETE /v1/stories/:id
Authorization: Bearer {token}
Role: VENDOR
```

**Responses**

- **204 No Content**
- **401 Unauthorized**
- **403 Forbidden** (not owner)
- **404 Not Found**

### Customer Endpoints

#### Get Vendor Stories (by vendor ID or slug)

```
GET /v1/stories/vendors/:vendorId
Public: Yes (optional auth for view tracking)
```

**Responses**

- **200 OK**
  - Body: `StoryResponseDto[]`
- **404 Not Found** (invalid vendor)

#### Get Following Stories

```
GET /v1/stories/following?page=1&limit=20
Authorization: Bearer {token}
Role: CUSTOMER, VENDOR
```

**Responses**

- **200 OK**
  - Body: `PaginatedStoriesResponseDto`
- **401 Unauthorized**

#### Get Explore Stories

```
GET /v1/stories/explore?page=1&limit=20
Public: Yes (optional auth for view tracking)
```

**Responses**

- **200 OK**
  - Body: `PaginatedStoriesResponseDto`

#### Mark Story as Viewed

```
POST /v1/stories/:id/view
Authorization: Bearer {token}
Role: CUSTOMER, VENDOR
```

**Responses**

- **204 No Content**
- **400 Bad Request** (expired/inactive)
- **401 Unauthorized**
- **404 Not Found**

#### Toggle Like on Story

```
POST /v1/stories/:id/like
Authorization: Bearer {token}
Role: CUSTOMER, VENDOR
```

**Responses**

- **200 OK**
  - Body: `{ "liked": true, "likeCount": 11 }`
- **400 Bad Request** (expired/inactive)
- **401 Unauthorized**
- **404 Not Found**

#### Get Like Status

```
GET /v1/stories/:id/like/status
Authorization: Bearer {token}
Role: CUSTOMER, VENDOR
```

**Responses**

- **200 OK**
  - Body: `{ "liked": true }`
- **401 Unauthorized**

#### Create Story Comment

```
POST /v1/stories/:id/comments
Authorization: Bearer {token}
Role: CUSTOMER, VENDOR
Body: CreateStoryCommentDto
```

**Request Body**

```json
{
  "content": "Great story!",
  "parentId": "optional-parent-comment-uuid"
}
```

**Responses**

- **201 Created**
  - Body: Comment object with user info
- **400 Bad Request** (expired/inactive, validation errors)
- **401 Unauthorized**
- **404 Not Found** (story or parent comment)

#### Get Story Comments

```
GET /v1/stories/:id/comments?page=1&limit=20
Public: Yes
```

Returns top-level comments with nested replies.

**Responses**

- **200 OK**
  - Body: Paginated comments with replies
- **404 Not Found**

#### Update Own Comment

```
PUT /v1/stories/comments/:commentId
Authorization: Bearer {token}
Role: CUSTOMER, VENDOR
Body: UpdateStoryCommentDto
```

**Request Body**

```json
{
  "content": "Updated comment text"
}
```

**Responses**

- **200 OK**
  - Body: Updated comment object
- **401 Unauthorized**
- **403 Forbidden** (not owner)
- **404 Not Found**

#### Delete Own Comment

```
DELETE /v1/stories/comments/:commentId
Authorization: Bearer {token}
Role: CUSTOMER, VENDOR
```

**Responses**

- **200 OK**
  - Body: `{ "message": "Comment deleted successfully" }`
- **401 Unauthorized**
- **403 Forbidden** (not owner)
- **404 Not Found**

#### Get Single Story

```
GET /v1/stories/:id
Public: Yes (optional auth for view/like tracking)
```

**Responses**

- **200 OK**
  - Body: `StoryResponseDto`
- **404 Not Found**

### Upload Endpoint

#### Upload Story Media

```
POST /v1/upload/story
Authorization: Bearer {token}
Role: VENDOR
Content-Type: multipart/form-data
Body: { file: <image or video file> }
```

**Responses**

- **201 Created**
  - Body: `UploadResponseDto`
- **400 Bad Request** (invalid type or size)
- **401 Unauthorized**
- **403 Forbidden** (non-vendor)

**Supported formats:**

- Images: JPEG, PNG, GIF, WebP, SVG (max 5MB)
- Videos: MP4, MOV, AVI, WebM (max 50MB)

## Usage Flow

### Vendor Publishing a Story

1. **Upload media**

   ```
   POST /v1/upload/story
   { file: story_media.mp4 }

   Response: { url: "/uploads/stories/stories-abc-123.mp4", ... }
   ```

2. **Create story**
   ```
   POST /v1/stories
   {
     "mediaUrl": "/uploads/stories/stories-abc-123.mp4",
     "mediaType": "VIDEO",
     "caption": "Check out our new collection!",
     "captionAr": "تحقق من مجموعتنا الجديدة!",
     "linkType": "PRODUCT",
     "linkId": "product-uuid"
   }
   ```

### Customer Viewing Stories

1. **View stories from followed vendors**

   ```
   GET /v1/stories/following?page=1&limit=20
   ```

   Returns vendors grouped with their stories, sorted by unviewed first.

2. **View specific vendor's stories**

   ```
   GET /v1/stories/vendors/vendor-slug
   ```

3. **Mark as viewed** (automatic when opening a story)
   ```
   POST /v1/stories/abc-story-id/view
   ```

### Liking a Story

1. **Toggle like** (like if not liked, unlike if already liked)

   ```
   POST /v1/stories/abc-story-id/like

   Response: { "liked": true, "likeCount": 11 }
   ```

2. **Check like status**

   ```
   GET /v1/stories/abc-story-id/like/status

   Response: { "liked": true }
   ```

### Commenting on a Story

1. **Add a comment**

   ```
   POST /v1/stories/abc-story-id/comments
   { "content": "Love this!" }

   Response: { "id": "comment-uuid", "content": "Love this!", "user": { ... }, ... }
   ```

2. **Reply to a comment**

   ```
   POST /v1/stories/abc-story-id/comments
   { "content": "Thanks!", "parentId": "parent-comment-uuid" }
   ```

3. **Get comments** (paginated, top-level with nested replies)

   ```
   GET /v1/stories/abc-story-id/comments?page=1&limit=20
   ```

4. **Update own comment**

   ```
   PUT /v1/stories/comments/comment-uuid
   { "content": "Updated text" }
   ```

5. **Delete own comment**
   ```
   DELETE /v1/stories/comments/comment-uuid
   ```

## Features

### Automatic Expiry

- Stories expire 24 hours after creation
- Daily cleanup job runs at 3:00 AM
- Deletes expired stories and their media files

### View Tracking

- Unique views per user per story
- View count cached on story for performance
- View status included in responses for authenticated users

### Likes

- Toggle like/unlike with a single endpoint
- One like per user per story (enforced by unique constraint)
- Cached `likeCount` on story for performance (incremented/decremented in transaction)
- `hasLiked` status included in story responses for authenticated users
- Batch like status checks in feed endpoints

### Comments

- Top-level comments and nested replies (one level deep via `parentId`)
- Paginated comment retrieval with replies included inline
- Users can update or delete their own comments (hard delete)
- Comment count included in story responses via `commentCount`
- Only active stories (not expired) accept new comments

### Follow Integration

- Following feed shows stories from followed vendors only
- Unviewed stories prioritized
- Sorted by latest story time

### Link Capabilities

Stories can link to:

- Products (`linkType: PRODUCT`, `linkId: product-id`)
- Categories (`linkType: CATEGORY`, `linkId: category-id`)
- External URLs (`linkType: EXTERNAL`, `linkUrl: https://...`)
- No link (`linkType: NONE`)

### Bilingual Support

- English and Arabic captions
- Follows existing app bilingual pattern

## Technical Details

### Storage

- Media files stored in `uploads/stories/`
- Naming pattern: `stories-{uuid}.{ext}`
- Static file serving via Express

### Cleanup Service

- Uses `@nestjs/schedule` for cron jobs
- Runs daily at 3:00 AM (`CronExpression.EVERY_DAY_AT_3AM`)
- Deletes database records and physical files
- Manual trigger available: `StoriesCleanupService.triggerManualCleanup()`

### Performance

- Cached view and like counts on stories
- Batch view and like status checks in feeds
- Pagination for feeds and comments
- Indexed queries: `[vendorId]`, `[isActive, expiresAt]`, `[createdAt]`
- Comment indexes: `[storyId]`, `[userId]`, `[parentId]`, `[createdAt]`
- Like indexes: `[storyId]`, `[userId]`

### Security

- Vendor can only delete own stories
- Users can only update/delete own comments
- Upload restricted to vendors
- Likes and comments require authentication (CUSTOMER or VENDOR)
- Comments are public to read, authenticated to create
- JWT authentication for protected endpoints
- Role-based access control

## Response Examples

### Upload Response (Story Media)

```json
{
  "url": "/uploads/stories/stories-abc-123.mp4",
  "originalName": "story_media.mp4",
  "filename": "stories-abc-123.mp4",
  "size": 20485760,
  "mimetype": "video/mp4",
  "folder": "stories"
}
```

### Single Story Response

```json
{
  "id": "story-uuid",
  "vendorId": "vendor-uuid",
  "mediaUrl": "/uploads/stories/stories-abc.jpg",
  "mediaType": "IMAGE",
  "caption": "New arrivals!",
  "captionAr": "وصل حديثاً!",
  "linkType": "PRODUCT",
  "linkId": "product-uuid",
  "isActive": true,
  "expiresAt": "2026-02-09T10:00:00Z",
  "viewCount": 150,
  "likeCount": 42,
  "commentCount": 7,
  "createdAt": "2026-02-08T10:00:00Z",
  "updatedAt": "2026-02-08T10:00:00Z",
  "hasViewed": false,
  "hasLiked": true,
  "vendor": {
    "id": "vendor-uuid",
    "storeName": "Fashion Store",
    "storeNameAr": "متجر الموضة",
    "slug": "fashion-store",
    "logo": "/uploads/vendors/logo.jpg"
  }
}
```

### Story Comments Response

```json
{
  "data": [
    {
      "id": "comment-uuid",
      "storyId": "story-uuid",
      "userId": "user-uuid",
      "content": "Love this collection!",
      "isActive": true,
      "createdAt": "2026-02-08T11:00:00Z",
      "updatedAt": "2026-02-08T11:00:00Z",
      "user": {
        "id": "user-uuid",
        "firstName": "Ahmed",
        "lastName": "Ali"
      },
      "replies": [
        {
          "id": "reply-uuid",
          "storyId": "story-uuid",
          "userId": "vendor-user-uuid",
          "parentId": "comment-uuid",
          "content": "Thank you!",
          "isActive": true,
          "createdAt": "2026-02-08T11:05:00Z",
          "updatedAt": "2026-02-08T11:05:00Z",
          "user": {
            "id": "vendor-user-uuid",
            "firstName": "Store",
            "lastName": "Owner"
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 7,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Grouped Stories Response (Following/Explore)

```json
{
  "data": [
    {
      "vendor": {
        "id": "vendor-uuid",
        "storeName": "Fashion Store",
        "storeNameAr": "متجر الموضة",
        "slug": "fashion-store",
        "logo": "/uploads/vendors/logo.jpg"
      },
      "stories": [
        {
          /* story object */
        },
        {
          /* story object */
        }
      ],
      "allViewed": false,
      "latestStoryAt": "2026-02-08T12:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

## Module Structure

```
src/stories/
├── dto/
│   ├── create-story.dto.ts
│   ├── create-story-comment.dto.ts
│   ├── story-response.dto.ts
│   ├── story-query.dto.ts
│   └── index.ts
├── stories.controller.ts
├── stories.service.ts
├── stories-cleanup.service.ts
├── stories.module.ts
└── index.ts
```

## Dependencies

- `@nestjs/schedule` - Cron job scheduling
- Existing: `@prisma/client`, `@nestjs/swagger`, `class-validator`

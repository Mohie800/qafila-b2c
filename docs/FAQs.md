# FAQs API

Base URL: `/v1/faqs`

The FAQs module provides bilingual (English/Arabic) FAQ management with categories. Public endpoints are available without authentication. Admin endpoints require **JWT Authentication** (`Bearer <token>`) and **ADMIN** role.

---

## Endpoints

### Public Endpoints

These endpoints are accessible without authentication.

---

### 1. Get All FAQ Categories

```
GET /v1/faqs/categories
```

**Query Parameters:**

| Param      | Type    | Default | Description             |
| ---------- | ------- | ------- | ----------------------- |
| `isActive` | boolean | -       | Filter by active status |

**Response: `200 OK`**

```json
[
  {
    "id": "uuid",
    "nameEn": "Shipping & Delivery",
    "nameAr": "الشحن والتوصيل",
    "sortOrder": 0,
    "isActive": true,
    "_count": {
      "faqs": 5
    },
    "createdAt": "2026-02-19T10:00:00.000Z",
    "updatedAt": "2026-02-19T10:00:00.000Z"
  }
]
```

Categories are sorted by `sortOrder` ascending.

---

### 2. Get FAQ Category by ID

```
GET /v1/faqs/categories/:id
```

**Path Parameters:**

| Param | Type | Description |
| ----- | ---- | ----------- |
| `id`  | UUID | Category ID |

**Response: `200 OK`**

Returns the category with its active FAQs included.

```json
{
  "id": "uuid",
  "nameEn": "Shipping & Delivery",
  "nameAr": "الشحن والتوصيل",
  "sortOrder": 0,
  "isActive": true,
  "faqs": [
    {
      "id": "uuid",
      "questionEn": "How long does delivery take?",
      "questionAr": "كم يستغرق التوصيل؟",
      "answerEn": "Delivery typically takes 3-5 business days.",
      "answerAr": "يستغرق التوصيل عادةً من 3 إلى 5 أيام عمل.",
      "sortOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-19T10:00:00.000Z",
      "updatedAt": "2026-02-19T10:00:00.000Z"
    }
  ],
  "createdAt": "2026-02-19T10:00:00.000Z",
  "updatedAt": "2026-02-19T10:00:00.000Z"
}
```

**Errors:**

| Status | Description        |
| ------ | ------------------ |
| `404`  | Category not found |

---

### 3. Get All FAQs

```
GET /v1/faqs
```

**Query Parameters:**

| Param        | Type    | Default | Description             |
| ------------ | ------- | ------- | ----------------------- |
| `categoryId` | UUID    | -       | Filter by category      |
| `isActive`   | boolean | -       | Filter by active status |

**Example:**

```
GET /v1/faqs?categoryId=550e8400-e29b-41d4-a716-446655440000&isActive=true
```

**Response: `200 OK`**

```json
[
  {
    "id": "uuid",
    "categoryId": "uuid",
    "questionEn": "How long does delivery take?",
    "questionAr": "كم يستغرق التوصيل؟",
    "answerEn": "Delivery typically takes 3-5 business days.",
    "answerAr": "يستغرق التوصيل عادةً من 3 إلى 5 أيام عمل.",
    "sortOrder": 0,
    "isActive": true,
    "category": {
      "id": "uuid",
      "nameEn": "Shipping & Delivery",
      "nameAr": "الشحن والتوصيل"
    },
    "createdAt": "2026-02-19T10:00:00.000Z",
    "updatedAt": "2026-02-19T10:00:00.000Z"
  }
]
```

FAQs are sorted by `sortOrder` ascending.

---

### 4. Get FAQ by ID

```
GET /v1/faqs/:id
```

**Path Parameters:**

| Param | Type | Description |
| ----- | ---- | ----------- |
| `id`  | UUID | FAQ ID      |

**Response: `200 OK`**

```json
{
  "id": "uuid",
  "categoryId": "uuid",
  "questionEn": "How long does delivery take?",
  "questionAr": "كم يستغرق التوصيل؟",
  "answerEn": "Delivery typically takes 3-5 business days.",
  "answerAr": "يستغرق التوصيل عادةً من 3 إلى 5 أيام عمل.",
  "sortOrder": 0,
  "isActive": true,
  "category": {
    "id": "uuid",
    "nameEn": "Shipping & Delivery",
    "nameAr": "الشحن والتوصيل"
  },
  "createdAt": "2026-02-19T10:00:00.000Z",
  "updatedAt": "2026-02-19T10:00:00.000Z"
}
```

**Errors:**

| Status | Description   |
| ------ | ------------- |
| `404`  | FAQ not found |

---

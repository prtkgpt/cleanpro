# CleanPro CRM - API Routes

## Authentication & Authorization

All routes (except `/api/auth/*` and `/api/public/*`) require authentication via NextAuth session.

**Headers:**
```
Cookie: next-auth.session-token=...
```

**Authorization:**
- Middleware extracts `workspaceId` from authenticated user
- All queries automatically scoped to workspace
- Role-based permissions enforced per route

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

## 1. Authentication Routes

### POST /api/auth/signup
**Public**

Create new workspace + admin user.

**Request:**
```json
{
  "workspaceName": "Clean Sweep LLC",
  "workspaceSlug": "clean-sweep",
  "email": "owner@cleansweep.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workspace": {
      "id": "clxxx",
      "name": "Clean Sweep LLC",
      "slug": "clean-sweep"
    },
    "user": {
      "id": "usr_xxx",
      "email": "owner@cleansweep.com",
      "role": "ADMIN"
    }
  }
}
```

### POST /api/auth/signin
**Public**

Handled by NextAuth.

### POST /api/auth/signout
Sign out current user.

---

## 2. Workspace Routes

### GET /api/workspaces/current
Get current workspace details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "Clean Sweep LLC",
    "slug": "clean-sweep",
    "timezone": "America/New_York",
    "currency": "USD",
    "cancellationPolicyHours": 24,
    "requireDeposit": true,
    "depositPercent": 25
  }
}
```

### PATCH /api/workspaces/current
**ADMIN only**

Update workspace settings.

**Request:**
```json
{
  "name": "Clean Sweep Pro",
  "cancellationPolicyHours": 48,
  "depositPercent": 30
}
```

---

## 3. Customer Routes

### GET /api/customers
**ADMIN, DISPATCHER**

List all customers.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 50)
- `search` - Search name, email, phone
- `tags` - Filter by tags (comma-separated)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cust_xxx",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "tags": ["vip", "recurring"],
      "createdAt": "2024-01-15T10:00:00Z",
      "addresses": [
        {
          "id": "addr_xxx",
          "street": "123 Main St",
          "city": "Austin",
          "state": "TX",
          "zip": "78701",
          "isDefault": true
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### POST /api/customers
**ADMIN, DISPATCHER**

Create new customer.

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "TempPass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "tags": ["referral"],
  "address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFeet": 1800
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cust_xxx",
    "userId": "usr_xxx",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com"
  }
}
```

### GET /api/customers/:id
Get customer details.

### PATCH /api/customers/:id
Update customer.

### DELETE /api/customers/:id
**ADMIN only**

Soft delete customer (or prevent if has active bookings).

---

## 4. Booking Routes

### GET /api/bookings
**ADMIN, DISPATCHER**

List bookings.

**Query Params:**
- `page`, `limit`
- `status` - Filter by status
- `customerId` - Filter by customer
- `cleanerId` - Filter by assigned cleaner
- `startDate`, `endDate` - Date range
- `sortBy` - `scheduledDate`, `createdAt`, `status`
- `order` - `asc`, `desc`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_xxx",
      "customer": {
        "id": "cust_xxx",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "address": {
        "street": "123 Main St",
        "city": "Austin"
      },
      "service": {
        "id": "svc_xxx",
        "name": "Standard Cleaning"
      },
      "scheduledDate": "2024-02-01",
      "scheduledTime": "09:00",
      "durationMinutes": 120,
      "status": "CONFIRMED",
      "total": 150.00,
      "assignments": [
        {
          "cleaner": {
            "id": "cleaner_xxx",
            "firstName": "Maria"
          }
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### POST /api/bookings
**ADMIN, DISPATCHER, CUSTOMER**

Create new booking.

**Request:**
```json
{
  "customerId": "cust_xxx",
  "addressId": "addr_xxx",
  "serviceId": "svc_xxx",
  "scheduledDate": "2024-02-01",
  "scheduledTime": "09:00",
  "notes": "Please use eco-friendly products",
  "createInvoice": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking_xxx",
      "status": "CONFIRMED",
      "scheduledDate": "2024-02-01",
      "total": 150.00
    },
    "invoice": {
      "id": "inv_xxx",
      "invoiceNumber": "INV-2024-001",
      "total": 150.00
    }
  }
}
```

### GET /api/bookings/:id
Get booking details including assignments, checklist, photos.

### PATCH /api/bookings/:id
Update booking (status, date, notes, etc.).

**Request:**
```json
{
  "status": "COMPLETED",
  "completedAt": "2024-02-01T11:30:00Z",
  "notes": "Job completed successfully"
}
```

### DELETE /api/bookings/:id
Cancel booking.

### POST /api/bookings/:id/assign
**ADMIN, DISPATCHER**

Assign cleaner(s) to booking.

**Request:**
```json
{
  "cleanerIds": ["cleaner_xxx", "cleaner_yyy"]
}
```

---

## 5. Calendar Routes

### GET /api/calendar
**ADMIN, DISPATCHER**

Get calendar view of bookings.

**Query Params:**
- `view` - `day`, `week`, `month`
- `date` - ISO date (e.g., `2024-02-01`)
- `cleanerId` - Filter by cleaner

**Response:**
```json
{
  "success": true,
  "data": {
    "view": "week",
    "startDate": "2024-01-29",
    "endDate": "2024-02-04",
    "bookings": [
      {
        "id": "booking_xxx",
        "scheduledDate": "2024-02-01",
        "scheduledTime": "09:00",
        "durationMinutes": 120,
        "customer": { ... },
        "assignments": [
          {
            "cleaner": {
              "id": "cleaner_xxx",
              "firstName": "Maria",
              "color": "#3b82f6"
            }
          }
        ]
      }
    ],
    "cleaners": [
      {
        "id": "cleaner_xxx",
        "firstName": "Maria",
        "color": "#3b82f6"
      }
    ]
  }
}
```

---

## 6. Cleaner Routes

### GET /api/cleaners
**ADMIN, DISPATCHER**

List all cleaners.

### POST /api/cleaners
**ADMIN**

Create new cleaner.

**Request:**
```json
{
  "email": "maria@example.com",
  "password": "TempPass123!",
  "firstName": "Maria",
  "lastName": "Garcia",
  "phone": "+1234567890",
  "hourlyRate": 20.00,
  "hireDate": "2024-01-01",
  "availability": {
    "monday": { "start": "09:00", "end": "17:00" },
    "tuesday": { "start": "09:00", "end": "17:00" },
    "wednesday": { "start": "09:00", "end": "17:00" },
    "thursday": { "start": "09:00", "end": "17:00" },
    "friday": { "start": "09:00", "end": "17:00" }
  }
}
```

### GET /api/cleaners/jobs
**CLEANER only**

Get jobs for current cleaner.

**Query Params:**
- `view` - `today`, `upcoming`, `past`
- `status` - Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_xxx",
      "scheduledDate": "2024-02-01",
      "scheduledTime": "09:00",
      "customer": {
        "firstName": "Jane",
        "phone": "+1234567890"
      },
      "address": {
        "street": "123 Main St",
        "city": "Austin",
        "accessCode": "1234",
        "accessInstructions": "Gate code same as door"
      },
      "service": {
        "name": "Standard Cleaning"
      },
      "notes": "Please use eco-friendly products",
      "status": "ASSIGNED",
      "checklist": [
        {
          "id": "check_xxx",
          "title": "Kitchen - clean counters",
          "completed": false
        }
      ],
      "assignment": {
        "startTime": null,
        "endTime": null
      }
    }
  ]
}
```

### POST /api/cleaners/jobs/:bookingId/start
**CLEANER only**

Start job timer.

**Response:**
```json
{
  "success": true,
  "data": {
    "startTime": "2024-02-01T09:05:00Z"
  }
}
```

### POST /api/cleaners/jobs/:bookingId/complete
**CLEANER only**

Mark job complete.

**Request:**
```json
{
  "notes": "All tasks completed. Left extra supplies in bathroom.",
  "issues": ""
}
```

### POST /api/cleaners/jobs/:bookingId/photos
**CLEANER only**

Upload photos.

**Request:** (multipart/form-data)
```
file: [image file]
type: "BEFORE" | "AFTER" | "ISSUE"
caption: "Optional description"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "photo_xxx",
    "url": "https://s3.../photo.jpg",
    "type": "AFTER"
  }
}
```

### PATCH /api/cleaners/jobs/:bookingId/checklist/:itemId
**CLEANER only**

Update checklist item.

**Request:**
```json
{
  "completed": true
}
```

---

## 7. Customer Portal Routes

### GET /api/customer/bookings
**CUSTOMER only**

Get customer's bookings.

**Query Params:**
- `status` - `upcoming`, `past`

### POST /api/customer/book
**CUSTOMER only**

Self-book flow.

**Request:**
```json
{
  "addressId": "addr_xxx",
  "serviceId": "svc_xxx",
  "scheduledDate": "2024-02-05",
  "scheduledTime": "10:00",
  "notes": "Optional notes"
}
```

### POST /api/customer/bookings/:id/reschedule
**CUSTOMER only**

Reschedule booking (if within policy).

**Request:**
```json
{
  "newDate": "2024-02-06",
  "newTime": "14:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_xxx",
    "scheduledDate": "2024-02-06",
    "scheduledTime": "14:00"
  }
}
```

### POST /api/customer/bookings/:id/cancel
**CUSTOMER only**

Cancel booking (if within policy).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_xxx",
    "status": "CANCELLED",
    "refundAmount": 37.50
  }
}
```

---

## 8. Payment Routes

### POST /api/payments/create-intent
**CUSTOMER, ADMIN, DISPATCHER**

Create Stripe payment intent for invoice.

**Request:**
```json
{
  "invoiceId": "inv_xxx",
  "savePaymentMethod": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 15000,
    "currency": "usd"
  }
}
```

### POST /api/payments/confirm
Confirm payment and update invoice.

**Request:**
```json
{
  "invoiceId": "inv_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST /api/webhooks/stripe
**Public** (but signature verified)

Handle Stripe webhooks.

**Events handled:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

---

## 9. Service Routes

### GET /api/services
Get all active services.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "svc_xxx",
      "name": "Standard Cleaning",
      "type": "STANDARD",
      "description": "Regular maintenance cleaning",
      "basePrice": 120.00,
      "estimatedMinutes": 120,
      "isActive": true
    }
  ]
}
```

### POST /api/services
**ADMIN, DISPATCHER**

Create new service.

### PATCH /api/services/:id
Update service.

---

## 10. Message Routes

### GET /api/messages
**ADMIN, DISPATCHER**

Get message history.

**Query Params:**
- `page`, `limit`
- `type` - `SMS`, `EMAIL`
- `status` - Filter by status
- `customerId` - Filter by customer

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_xxx",
      "type": "SMS",
      "to": "+1234567890",
      "body": "Reminder: Your cleaning is scheduled for tomorrow at 9am.",
      "status": "DELIVERED",
      "sentAt": "2024-01-31T18:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /api/messages/send
**ADMIN, DISPATCHER**

Send manual message.

**Request:**
```json
{
  "type": "SMS",
  "to": "+1234567890",
  "body": "Custom message text"
}
```

---

## 11. Automation Routes

### GET /api/automations
**ADMIN**

List all automations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "auto_xxx",
      "type": "BOOKING_CONFIRMATION",
      "name": "Booking Confirmation",
      "enabled": true,
      "emailTemplate": "Thank you for booking with us...",
      "smsTemplate": "Your cleaning is confirmed for {{date}} at {{time}}."
    }
  ]
}
```

### PATCH /api/automations/:id
**ADMIN**

Update automation template or enable/disable.

**Request:**
```json
{
  "enabled": true,
  "smsTemplate": "Updated template with {{variables}}"
}
```

---

## 12. Reporting Routes

### GET /api/reports/revenue
**ADMIN, DISPATCHER**

Revenue report.

**Query Params:**
- `startDate`, `endDate`
- `groupBy` - `day`, `week`, `month`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15000.00,
    "breakdown": [
      {
        "date": "2024-02-01",
        "revenue": 1250.00,
        "jobCount": 10
      }
    ]
  }
}
```

### GET /api/reports/jobs
Job statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "completed": 145,
    "cancelled": 3,
    "noShows": 2,
    "completionRate": 96.7
  }
}
```

### GET /api/reports/cleaners
Cleaner utilization.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "cleaner": {
        "id": "cleaner_xxx",
        "firstName": "Maria"
      },
      "jobsCompleted": 45,
      "hoursWorked": 120.5,
      "revenue": 4800.00
    }
  ]
}
```

### GET /api/reports/customers
Customer insights.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 85,
    "recurring": 32,
    "oneTime": 53,
    "repeatRate": 37.6,
    "averageValue": 165.00
  }
}
```

---

## 13. Recurring Rules Routes

### GET /api/recurring-rules
**ADMIN, DISPATCHER**

List recurring rules.

### POST /api/recurring-rules
**ADMIN, DISPATCHER**

Create recurring rule.

**Request:**
```json
{
  "customerId": "cust_xxx",
  "addressId": "addr_xxx",
  "serviceId": "svc_xxx",
  "frequency": "BIWEEKLY",
  "dayOfWeek": 1,
  "preferredTime": "09:00",
  "startDate": "2024-02-05"
}
```

### PATCH /api/recurring-rules/:id
Update or pause recurring rule.

### POST /api/recurring-rules/:id/skip
Skip specific occurrence.

**Request:**
```json
{
  "skipDate": "2024-02-19",
  "reason": "Customer on vacation"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `WORKSPACE_NOT_FOUND` | Workspace doesn't exist |
| `CUSTOMER_EXISTS` | Email already registered |
| `BOOKING_CONFLICT` | Cleaner already assigned at that time |
| `CANCELLATION_POLICY` | Cannot cancel within policy window |
| `PAYMENT_FAILED` | Stripe payment failed |
| `RATE_LIMIT` | Too many requests |

---

## Rate Limiting

- Anonymous: 10 req/min
- Authenticated: 100 req/min
- Admin: 200 req/min

Responses include headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643723400
```

# Rider System - Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
├──────────────────────┬──────────────────┬──────────────────────┤
│  Rider Pages         │  Pharmacy Pages  │  Auth Pages          │
├──────────────────────┼──────────────────┼──────────────────────┤
│ • RiderRegister      │ • Attached       │ • RiderRegister      │
│ • RiderDashboard     │   RidersPage     │ • Login              │
│   - City Select      │                  │ • Register           │
│   - Pharmacy Select  │                  │                      │
│   - Order Tracking   │                  │                      │
└──────────────────────┴──────────────────┴──────────────────────┘
           │                     │                    │
           │                     │                    │
           └──────────┬──────────┴────────────────────┘
                      │
                      ↓ API Calls (axios)
           ┌──────────────────────────┐
           │   Backend Routes Layer   │
           ├──────────────────────────┤
           │ POST   /auth/register    │
           │ POST   /auth/login       │
           │ GET    /riders/profile   │
           │ PUT    /riders/profile   │
           │ GET    /riders/cities    │
           │ GET    /riders/pharmacies│
           │ POST   /riders/affiliate │
           │ POST   /riders/accept    │
           │ PUT    /riders/status    │
           │ GET    /riders/orders    │
           │ GET    /pharmacy/riders  │
           │ POST   /pharmacy/assign  │
           └──────────────────────────┘
                      │
                      ↓
           ┌──────────────────────────┐
           │  Controller Layer        │
           ├──────────────────────────┤
           │ riderController          │
           │ authController           │
           │ pharmacyOwnerController  │
           └──────────────────────────┘
                      │
                      ↓
           ┌──────────────────────────┐
           │   Business Logic Layer   │
           │   (Service Methods)      │
           └──────────────────────────┘
                      │
                      ↓
           ┌──────────────────────────┐
           │  Prisma ORM Layer        │
           ├──────────────────────────┤
           │ • rider.findUnique()     │
           │ • rider.update()         │
           │ • pharmacy.findMany()    │
           │ • fulfillment.update()   │
           └──────────────────────────┘
                      │
                      ↓
           ┌──────────────────────────┐
           │  PostgreSQL Database     │
           ├──────────────────────────┤
           │ • users table            │
           │ • riders table           │
           │ • pharmacies table       │
           │ • order_fulfillments     │
           │ • orders table           │
           └──────────────────────────┘
```

---

## 📊 Data Models & Relationships

### **Core Models**

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ name            │
│ phone           │
│ role (ENUM)     │
│ is_active       │
│ created_at      │
└────────┬────────┘
         │
         ├──→ ┌──────────────┐
         │    │    Rider     │
         │    ├──────────────┤
         │    │ id (PK)      │
         │    │ user_id (FK) │────────→ Pharmacy
         │    │ vehicle_type │
         │    │ vehicle_no   │
         │    │ city         │
         │    │ is_available │
         │    │ affil_pharm_id (FK)
         │    └──────────────┘
         │
         ├──→ ┌──────────────────┐
         │    │ PharmacyOwner    │
         │    ├──────────────────┤
         │    │ id (PK)          │
         │    │ user_id (FK)     │
         │    └────────┬─────────┘
         │             │
         │             └──→ ┌────────────────┐
         │                  │   Pharmacy     │
         │                  ├────────────────┤
         │                  │ id (PK)        │
         │                  │ owner_id (FK)  │
         │                  │ name           │
         │                  │ address        │
         │                  │ city           │
         │                  │ phone          │
         │                  │ latitude       │
         │                  │ longitude      │
         │                  │ is_active      │
         │                  └────┬───────────┘
         │                       │
         │                       ├──→ ┌──────────────────┐
         │                       │    │ PharmacyStock    │
         │                       │    ├──────────────────┤
         │                       │    │ id (PK)          │
         │                       │    │ pharmacy_id (FK) │
         │                       │    │ medicine_id (FK) │
         │                       │    │ price            │
         │                       │    │ is_available     │
         │                       │    └──────────────────┘
         │                       │
         │                       └──→ ┌──────────────────────┐
         │                            │ OrderFulfillment     │
         │                            ├──────────────────────┤
         │                            │ id (PK)              │
         │                            │ order_id (FK)        │
         │                            │ pharmacy_id (FK)     │
         │                            │ rider_id (FK) ◄──┐   │
         │                            │ subtotal         │   │
         │                            │ status           │   │
         │                            └──────────────────┘   │
         │                                                    │
         └────────────────────────────────────────────────────┘
              (Rider can be NULL until assigned)
```

---

## 🔄 Order Fulfillment Flow

```
Step 1: Order Created
┌─────────────────────────────────────┐
│ Customer accepts Proposal            │
│ Order created in PENDING status      │
│ OrderFulfillment created per pharmacy│
│ riderId = NULL (unassigned)          │
│ status = PENDING                     │
└─────────────┬───────────────────────┘
              │
              ↓
Step 2: Pharmacy Assigns Rider
┌─────────────────────────────────────┐
│ Pharmacy owner views unassigned orders
│ Selects rider from affiliated pool  │
│ System updates:                      │
│   - fulfillment.riderId = riderId   │
│   - fulfillment.status = PREPARING  │
│ Notification sent to rider          │
└─────────────┬───────────────────────┘
              │
              ↓
Step 3: Rider Accepts & Picks Up
┌─────────────────────────────────────┐
│ Rider views order in dashboard      │
│ Reviews customer details & address  │
│ Clicks "Accept Order"               │
│ System updates:                      │
│   - fulfillment.status = CONFIRMED  │
│ Then: "Picked Up - Start Delivery"  │
│ System updates:                      │
│   - fulfillment.status = DISPATCHED │
└─────────────┬───────────────────────┘
              │
              ↓
Step 4: In Transit
┌─────────────────────────────────────┐
│ Rider navigates to delivery address │
│ Checks delivery confirmation        │
│ Arrives at customer location        │
│ Confirms delivery with customer     │
└─────────────┬───────────────────────┘
              │
              ↓
Step 5: Delivery Confirmed
┌─────────────────────────────────────┐
│ Rider clicks "Mark as Delivered"    │
│ System updates:                      │
│   - fulfillment.status = DELIVERED  │
│ Order marked complete               │
│ Rider can see in history            │
└─────────────────────────────────────┘
```

---

## 🎬 State Machine Diagram

```
                    ┌──────────────┐
                    │   PENDING    │ ← Initial state (unassigned)
                    └──────┬───────┘
                           │
         [Pharmacy assigns rider & prepares]
                           │
                           ↓
              ┌────────────────────────┐
              │      CONFIRMED         │ ← Rider accepts order
              └────────┬───────────────┘
                       │
         [Rider picks up from pharmacy]
                       │
                       ↓
             ┌──────────────────────┐
             │    DISPATCHED        │ ← In transit
             └──────┬───────────────┘
                    │
         [Rider delivers to customer]
                    │
                    ↓
            ┌────────────────────┐
            │    DELIVERED       │ ← Final state
            └────────────────────┘

Alternative paths:
    PENDING ──→ CANCELLED [If pharmacy/rider cancels]
    CONFIRMED ──→ CANCELLED [If rider cancels]
    DISPATCHED ──→ CANCELLED [If urgent issue]
```

---

## 🔐 Role-Based Access Control

```
┌────────────────────────────────────────────────────────┐
│                    ROLE MATRIX                         │
├─────────────┬──────────────┬──────────────┬────────────┤
│   RIDER     │ PHARMACY_OWN │ ADMIN        │ CUSTOMER   │
├─────────────┼──────────────┼──────────────┼────────────┤
│ Profile:    │ Profile:     │ All:         │ Profile:   │
│ • View own  │ • View own   │ • View/Edit  │ • View own │
│ • Update own│ • Update own │ • Manage all │ • Update   │
│             │              │ • System     │   own      │
│ Orders:     │ Orders:      │   config     │            │
│ • View own  │ • View own   │              │ Orders:    │
│   assigned  │   fulfillments              │ • View own │
│ • Accept    │ • Assign     │              │ • Track    │
│ • Update    │   riders     │              │            │
│   status    │ • Update     │              │ Proposals: │
│             │   status     │              │ • View     │
│ Riders:     │              │              │ • Accept   │
│ • Register  │ Riders:      │              │ • Reject   │
│ • Affiliate │ • View       │              │            │
│ • View      │   affiliated │              │            │
│   pharmacy  │ • Manage     │              │            │
│             │   affiliation│              │            │
└─────────────┴──────────────┴──────────────┴────────────┘
```

---

## 📱 Frontend Routing Structure

```
/login
  ↓
/rider                          (Protected: RIDER role)
  ├─ Step 1: City Selection
  ├─ Step 2: Pharmacy Affiliation
  └─ Step 3: Dashboard
      ├─ Profile Summary
      ├─ Orders List
      └─ Expandable Order Details

/pharmacy-owner                 (Protected: PHARMACY_OWNER role)
  ├─ /pharmacy-owner
  │   └─ Overview
  ├─ /pharmacy-owner/riders
  │   ├─ Affiliated Riders Section
  │   └─ Orders Awaiting Assignment
  ├─ /pharmacy-owner/orders
  │   └─ All fulfillments
  ├─ /pharmacy-owner/inventory
  │   └─ Stock management
  └─ /pharmacy-owner/settings
      └─ Profile

/customer                       (Protected: CUSTOMER role)
  ├─ /customer
  │   └─ Overview
  ├─ /customer/upload
  │   └─ Prescription upload
  ├─ /customer/prescriptions
  │   └─ My prescriptions
  ├─ /customer/proposals
  │   └─ Proposals
  └─ /customer/orders
      └─ Order tracking
```

---

## 🔄 API Request/Response Cycle

### **Rider Affiliation Example**

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Frontend)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User fills: city, pharmacy, vehicleType, vehicleNumber    │
│  Clicks "Confirm Affiliation"                              │
│                                                             │
│  POST /riders/affiliate-pharmacy {                         │
│    pharmacyId: 5,                                          │
│    vehicleType: "Bike",                                    │
│    vehicleNumber: "ABC-123"                                │
│  }                                                          │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Request with JWT token
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  SERVER (Backend)                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Authenticate (JWT verification)                        │
│  2. Find Rider by userId                                   │
│  3. Verify Pharmacy exists and is active                   │
│  4. Update Rider:                                          │
│     - affiliatedPharmacyId = 5                            │
│     - city = pharmacy.city                                 │
│     - vehicleType = "Bike"                                │
│     - vehicleNumber = "ABC-123"                           │
│  5. Fetch updated Rider with affiliatedPharmacy data      │
│  6. Return success response                                │
│                                                             │
│  HTTP 200 {                                                │
│    message: "Successfully affiliated with XYZ Pharmacy",  │
│    profile: {                                              │
│      id: 1,                                                │
│      user: { ... },                                        │
│      affiliatedPharmacy: {                                 │
│        id: 5,                                              │
│        name: "XYZ Pharmacy",                              │
│        city: "Lahore",                                    │
│        address: "...",                                     │
│        phone: "..."                                        │
│      }                                                      │
│    }                                                        │
│  }                                                          │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Response
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Frontend)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Receive response                                       │
│  2. Update local state with new profile                   │
│  3. Show success toast/message                            │
│  4. Redirect to main dashboard (Step 3)                   │
│  5. Load orders via GET /riders/orders                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────┐
│     Frontend Security                    │
├─────────────────────────────────────────┤
│ • Input validation                      │
│ • Required field checks                 │
│ • Email format validation               │
│ • Password strength validation          │
│ • HTTPS enforcement                     │
│ • XSS protection (React auto-escape)    │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│     Network Security                     │
├─────────────────────────────────────────┤
│ • HTTPS/TLS encryption                  │
│ • JWT token in Authorization header     │
│ • CORS configuration                    │
│ • Rate limiting (optional)               │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│     Backend Security                     │
├─────────────────────────────────────────┤
│ • JWT verification                      │
│ • Role-based access control (RBAC)      │
│ • Input validation & sanitization       │
│ • SQL injection prevention (Prisma)     │
│ • Authorization checks per endpoint     │
│ • Password hashing (bcrypt)             │
│ • Email uniqueness enforcement          │
│ • Relationship validation (affiliation) │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│     Database Security                    │
├─────────────────────────────────────────┤
│ • PostgreSQL with authentication        │
│ • Foreign key constraints               │
│ • Unique constraints                    │
│ • NOT NULL constraints                  │
│ • Data encryption (at rest)             │
│ • Backup & recovery                     │
└─────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

```
Current Setup          →    Future Scaling
─────────────────────────────────────────────

Single Server                Multi-Server
  │                            │
  ├─ App Server               ├─ Load Balancer
  ├─ Database                 ├─ App Server 1
  └─ Cache                    ├─ App Server 2
                              ├─ App Server N
                              ├─ Database (Replicated)
                              ├─ Cache Layer (Redis)
                              └─ CDN for static files

Database Optimization:
  • Indexes on city, affiliatedPharmacyId
  • Query optimization for filters
  • Connection pooling
  • Read replicas for heavy queries

Real-time Features:
  • WebSocket for order notifications
  • Server-Sent Events (SSE) for status
  • Push notifications via Firebase/OneSignal

Message Queue:
  • Redis Queue for order assignments
  • Async processing of status updates
  • Email/SMS notifications
```

---

## 🎓 Technology Stack

```
FRONTEND
├─ React 18+ (UI framework)
├─ Vite (Build tool)
├─ Lucide React (Icons)
├─ Tailwind CSS (Styling)
└─ Axios (HTTP client)

BACKEND
├─ Node.js + Express (Server)
├─ Prisma ORM (Database access)
├─ PostgreSQL (Database)
├─ bcryptjs (Password hashing)
├─ jsonwebtoken (Auth tokens)
└─ CORS (Cross-origin)

DEPLOYMENT (Recommended)
├─ Frontend: Vercel / Netlify
├─ Backend: Heroku / Railway / AWS EC2
├─ Database: AWS RDS / Railway
└─ Storage: AWS S3 (for prescriptions)
```

---

This architecture is designed to be:
- **Scalable**: Can handle thousands of riders and orders
- **Secure**: Multiple security layers
- **Maintainable**: Clean separation of concerns
- **Performant**: Optimized queries and caching
- **Extensible**: Easy to add new features


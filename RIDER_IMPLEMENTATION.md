# 🚴 Rider Functionality - Complete Implementation Guide

## Overview

The Pharmacy Boy rider system provides a complete end-to-end delivery management solution. Riders can register, affiliate with pharmacies, accept orders, and track deliveries with a user-friendly real-world interface.

---

## 🎯 Feature Flow

### 1. **Rider Registration**
- **URL**: `/rider-register`
- Riders create an account with:
  - Full Name
  - Email
  - Phone Number
  - Password (min 6 characters)
- Upon success, redirected to login

### 2. **Rider Login**
- **URL**: `/login`
- Uses standard authentication
- Role-based redirection to rider dashboard

### 3. **City Selection**
- After login, rider selects their working city
- Cities populated from active pharmacies
- Rider filtered by selected city automatically

### 4. **Pharmacy Affiliation**
- Rider selects a pharmacy from the chosen city
- Provides vehicle information:
  - Vehicle Type (Bike, Car, Van, etc.)
  - Vehicle Number Plate (Registration)
- Confirms affiliation with selected pharmacy

### 5. **Rider Dashboard**
- **URL**: `/rider`
- Three main sections:
  1. **Profile Summary Cards**: Name, affiliated pharmacy, delivery stats
  2. **Deliveries List**: All orders assigned to this rider
  3. **Order Details & Tracking**: Expandable order cards with:
     - Customer name and phone
     - Pickup location (pharmacy address)
     - Delivery address
     - Medicines list
     - Real-time status updates

### 6. **Order Management**
**Order Statuses**:
- `PENDING` - Order available, rider can accept
- `CONFIRMED` - Rider accepted, preparing at pharmacy
- `PREPARING` - Pharmacy preparing medicines
- `DISPATCHED` - Rider picked up, in transit
- `DELIVERED` - Successfully delivered

**Rider Actions**:
1. Accept Order (PENDING → CONFIRMED)
2. Picked Up - Start Delivery (CONFIRMED/PREPARING → DISPATCHED)
3. Mark as Delivered (DISPATCHED → DELIVERED)

### 7. **Pharmacy Dashboard - Rider Management**
- **URL**: `/pharmacy-owner/riders`
- Two tabs:
  1. **Affiliated Riders**: Display all connected riders
  2. **Orders Awaiting Assignment**: Show unassigned orders
- Click "Assign Rider" to assign orders

---

## 🔧 Backend API Endpoints

### **Rider Endpoints** (`/riders`)

#### Public
```http
GET /riders/available-cities
```
Returns list of cities with active pharmacies

#### Protected (RIDER role required)
```http
GET /riders/profile
```
Get current rider profile including affiliated pharmacy

```http
PUT /riders/profile
```
Update rider profile (vehicle info, city, availability)

```http
GET /riders/pharmacies-by-city?city={city}
```
Get pharmacies in a specific city

```http
POST /riders/affiliate-pharmacy
Body: { pharmacyId, vehicleType, vehicleNumber }
```
Affiliate rider with a pharmacy

```http
GET /riders/orders
```
Get all orders assigned to this rider

```http
POST /riders/accept-order/{fulfillmentId}
```
Accept a pending order (PENDING → CONFIRMED)

```http
PUT /riders/fulfillment/{fulfillmentId}/status
Body: { status: "DISPATCHED" | "DELIVERED" }
```
Update fulfillment status

### **Pharmacy Owner Endpoints** (`/pharmacy-owner`)

#### Protected (PHARMACY_OWNER role required)
```http
GET /pharmacy-owner/affiliated-riders
```
Get all riders affiliated with this pharmacy

```http
POST /pharmacy-owner/fulfillment/{fulfillmentId}/assign-rider
Body: { riderId }
```
Assign a rider to an order

```http
PUT /pharmacy-owner/fulfillment/{fulfillmentId}/status
Body: { status }
```
Update order status

---

## 📱 Frontend Components

### **Rider Pages**

#### `RiderRegister.jsx` (`/rider-register`)
- Registration form with validation
- Email uniqueness check
- Password strength validation
- Modern gradient UI with Lucide icons

#### `RiderDashboard.jsx` (`/rider`)
- **Step 1**: City Selection
  - Grid of available cities
  - Real-time pharmacy population
  
- **Step 2**: Pharmacy Affiliation
  - List of pharmacies in selected city
  - Vehicle information form
  - Confirmation button
  
- **Step 3**: Main Dashboard
  - Profile summary cards
  - Orders list with expandable details
  - Status update buttons
  - Delivery checklist

### **Pharmacy Owner Pages**

#### `AttachedRidersPage.jsx` (`/pharmacy-owner/riders`)
- Affiliated riders grid/list
- Vehicle and contact information
- Active orders section
- Order assignment modal
- Status tracking

---

## 🗄️ Database Schema Updates

### **Rider Model** (Updated)
```prisma
model Rider {
  id                    Int      @id @default(autoincrement())
  userId                Int      @unique
  vehicleType           String?
  vehicleNumber         String?
  city                  String?
  isAvailable           Boolean  @default(true)
  affiliatedPharmacyId  Int?     // New: Links to affiliated pharmacy
  createdAt             DateTime @default(now())

  user                  User               @relation(...)
  affiliatedPharmacy    Pharmacy?          @relation("RiderAffiliation", ...)
  fulfillments          OrderFulfillment[]

  @@index([city])
  @@index([affiliatedPharmacyId])
}
```

### **Pharmacy Model** (Updated)
```prisma
model Pharmacy {
  // ... existing fields ...
  
  affiliatedRiders  Rider[]  @relation("RiderAffiliation")
}
```

---

## 🎨 UI/UX Features

### **Real-world App Design**
- **Modern Gradient Headers**: Slate-to-indigo gradients
- **Status Badges**: Color-coded (pending, confirmed, dispatched, delivered)
- **Expandable Cards**: Click to view full order details
- **Progress Indicators**: Visual checklist of delivery steps
- **Responsive Layout**: Works on mobile, tablet, desktop
- **Accessibility**: Semantic HTML, proper ARIA labels
- **Loading States**: Smooth spinners and placeholders

### **Visual Hierarchy**
- Primary actions (Accept Order, Confirm Assignment) in emerald/green
- Secondary actions in slate/gray
- Status information in appropriate colors
- Important metrics highlighted in larger fonts
- Supporting info in smaller, muted text

---

## 🔐 Security & Validation

### **Backend Validation**
- Email uniqueness check on registration
- Password hashing with bcrypt (12 rounds)
- JWT token validation
- Role-based access control (RBAC)
- Rider affiliation verification before order assignment
- City-based filtering for pharmacies

### **Frontend Validation**
- Required field checks
- Email format validation
- Password strength requirements
- Pharmacy selection mandatory before affiliation
- Rider selection mandatory before order assignment

---

## 📊 Order Assignment Flow

### **Pharmacy Perspective**
1. Order appears in "Orders Awaiting Assignment"
2. Pharmacy owner clicks "Assign Rider"
3. Modal shows available riders from affiliated pool
4. Select rider and confirm
5. Order moves to "Assigned" state with rider name

### **Rider Perspective**
1. Receives order notification in dashboard
2. Order in PENDING status
3. Reviews customer info, delivery address, medicines
4. Clicks "Accept Order" → CONFIRMED
5. Pharmacy prepares order
6. Rider picks up (status: DISPATCHED)
7. Delivers to customer (status: DELIVERED)

---

## 🚀 Running the Application

### **Backend**
```bash
cd backend
npm install
npx prisma migrate dev  # Run new migration for Rider-Pharmacy relation
npm start
```

### **Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **Access Points**
- Rider Registration: `http://localhost:5173/rider-register`
- Rider Dashboard: `http://localhost:5173/rider` (after login)
- Pharmacy Dashboard: `http://localhost:5173/pharmacy-owner/riders` (as pharmacy owner)

---

## 📋 Checklist for Full Implementation

- ✅ Backend schema updated (Rider-Pharmacy relationship)
- ✅ Rider controller with all endpoints
- ✅ Rider routes configured
- ✅ Pharmacy owner controller updated
- ✅ Pharmacy owner routes updated
- ✅ Rider registration page
- ✅ Rider dashboard (3-step process)
- ✅ Pharmacy rider management page
- ✅ Routes and navigation integrated
- ✅ Error handling and loading states
- ✅ Real-world UI/UX design

---

## 🐛 Troubleshooting

### **Rider can't find pharmacies**
- Ensure pharmacies exist in the database
- Check pharmacy `isActive` status
- Verify selected city matches pharmacy city

### **Order assignment fails**
- Verify rider is affiliated with same pharmacy
- Check if rider ID exists in database
- Ensure fulfillment belongs to correct pharmacy

### **Status updates not showing**
- Clear browser cache
- Refresh dashboard after update
- Check network tab for API response

### **Registration fails**
- Verify email is unique
- Check password length (min 6)
- Ensure all required fields are filled

---

## 📞 Support & Future Enhancements

### **Potential Features**
- Real-time GPS tracking
- Rider ratings and reviews
- Earnings dashboard
- Push notifications for orders
- Document verification system
- Performance analytics

### **Contact**
For implementation questions or issues, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready ✅

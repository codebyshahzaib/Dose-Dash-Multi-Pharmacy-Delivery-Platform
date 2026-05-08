# Rider Functionality - Changes

## Backend Changes

### 1. Schema Updates (`prisma/schema.prisma`)
- Added `affiliatedPharmacyId` field to `Rider` model
- Added `affiliatedRiders` relation to `Pharmacy` model

### 2. Controllers

**riderController.js** - New functions:
- `getAvailableCities()` - GET /riders/available-cities
- `getPharmaciesByCity()` - GET /riders/pharmacies-by-city?city=<city>
- `affiliateWithPharmacy()` - POST /riders/affiliate-pharmacy
- `updateFulfillmentStatus()` - PUT /riders/fulfillment/:id/status
- `acceptOrder()` - POST /riders/accept-order/:id

**pharmacyOwnerController.js** - New functions:
- `getAffiliatedRiders()` - GET /pharmacy-owner/affiliated-riders
- `assignRiderToFulfillment()` - POST /pharmacy-owner/fulfillment/:id/assign-rider
- `updateFulfillmentStatusPharmacy()` - PUT /pharmacy-owner/fulfillment/:id/status

### 3. Routes
- Updated `/src/routes/riders.js` with 7 new routes
- Updated `/src/routes/pharmacyOwner.js` with 3 new routes

---

## Frontend Changes

### 1. Pages Created
- `src/pages/auth/RiderRegister.jsx` - Rider registration form
- `src/pages/dashboards/pharmacy-owner/AttachedRidersPage.jsx` - Manage riders & orders

### 2. Pages Modified
- `src/pages/dashboards/RiderDashboard.jsx` - Complete rewrite with 3-step process
- `src/App.jsx` - Added routes for rider pages
- `src/components/PharmacyOwnerLayout.jsx` - Added riders nav link

### 3. Features Implemented

**Rider Flow:**
1. Registration at `/rider-register`
2. Login and city selection
3. Pharmacy affiliation with vehicle info
4. Dashboard with order list
5. Expandable order cards with status tracking
6. Accept/update order status buttons

**Pharmacy Flow:**
1. View affiliated riders
2. Assign orders to riders
3. Track order status

---

## API Endpoints Added

### Rider (`/riders`)
```
GET    /riders/available-cities
GET    /riders/pharmacies-by-city?city={city}
POST   /riders/affiliate-pharmacy
GET    /riders/orders
POST   /riders/accept-order/{fulfillmentId}
PUT    /riders/fulfillment/{fulfillmentId}/status
```

### Pharmacy Owner (`/pharmacy-owner`)
```
GET    /pharmacy-owner/affiliated-riders
POST   /pharmacy-owner/fulfillment/{fulfillmentId}/assign-rider
PUT    /pharmacy-owner/fulfillment/{fulfillmentId}/status
```

---

## Run Commands

**Backend:**
```bash
cd backend
npx prisma migrate dev
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## Test URLs

- Rider Registration: http://localhost:5173/rider-register
- Rider Dashboard: http://localhost:5173/rider
- Pharmacy Riders: http://localhost:5173/pharmacy-owner/riders

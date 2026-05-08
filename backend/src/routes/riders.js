import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  getRiderProfile,
  updateRiderProfile,
  getAvailableCities,
  getPharmaciesByCity,
  affiliateWithPharmacy,
  getRiderOrders,
  updateFulfillmentStatus,
  acceptOrder
} from '../controllers/riderController.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/available-cities', getAvailableCities);

// Protected routes (auth required + RIDER role)
router.use(authenticate, authorizeRoles('RIDER'));

router.get('/profile', getRiderProfile);
router.put('/profile', updateRiderProfile);
router.get('/pharmacies-by-city', getPharmaciesByCity);
router.post('/affiliate-pharmacy', affiliateWithPharmacy);
router.get('/orders', getRiderOrders);
router.put('/fulfillment/:fulfillmentId/status', updateFulfillmentStatus);
router.post('/accept-order/:fulfillmentId', acceptOrder);

export default router;

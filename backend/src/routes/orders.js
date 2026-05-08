import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  getCustomerOrders,
  getPharmacyOrders,
  updateFulfillmentStatus,
  assignRiderToFulfillment
} from '../controllers/orderController.js';

const router = express.Router();

router.use(authenticate);

// Customer sees their overall orders
router.get('/customer', authorizeRoles('CUSTOMER'), getCustomerOrders);

// Pharmacy owner sees their portion (fulfillments)
router.get('/pharmacy', authorizeRoles('PHARMACY_OWNER'), getPharmacyOrders);

// Owner/Rider update status of a specific fulfillment
router.patch('/fulfillments/:id/status', authorizeRoles('PHARMACY_OWNER', 'RIDER'), updateFulfillmentStatus);

// Owner assigns a rider to a specific fulfillment
router.patch('/fulfillments/:id/assign-rider', authorizeRoles('PHARMACY_OWNER'), assignRiderToFulfillment);

export default router;

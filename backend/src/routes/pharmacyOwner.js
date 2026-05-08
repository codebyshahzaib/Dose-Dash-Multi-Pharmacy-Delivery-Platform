import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  getPharmacySettings,
  updatePharmacySettings,
  searchGlobalMedicines,
  addMedicineToPharmacy,
  getPharmacyInventory,
  createAndLinkMedicine,
  getPharmacyOrders,
  getAffiliatedRiders,
  assignRiderToFulfillment,
  updateFulfillmentStatusPharmacy,
  registerRider
} from '../controllers/pharmacyOwnerController.js';

const router = express.Router();

// All routes require authenticated PHARMACY_OWNER
router.use(authenticate, authorizeRoles('PHARMACY_OWNER'));

router.get('/settings', getPharmacySettings);
router.put('/settings', updatePharmacySettings);

router.get('/orders', getPharmacyOrders);
router.get('/affiliated-riders', getAffiliatedRiders);
router.post('/register-rider', registerRider);
router.post('/fulfillment/:fulfillmentId/assign-rider', assignRiderToFulfillment);
router.put('/fulfillment/:fulfillmentId/status', updateFulfillmentStatusPharmacy);

router.get('/inventory/search', searchGlobalMedicines);
router.get('/inventory', getPharmacyInventory);
router.post('/inventory', addMedicineToPharmacy);
router.post('/inventory/new', createAndLinkMedicine);

export default router;

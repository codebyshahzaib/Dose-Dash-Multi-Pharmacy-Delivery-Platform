import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  getPlatformStats,
  listUsers,
  toggleUserStatus,
  createPharmacist,
  deleteUser,
  setPrimaryPharmacist
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/stats', getPlatformStats);
router.get('/users', listUsers);
router.patch('/users/:id', toggleUserStatus);
router.patch('/pharmacists/:id/primary', setPrimaryPharmacist);
router.delete('/users/:id', deleteUser);
router.post('/pharmacist', createPharmacist);

export default router;

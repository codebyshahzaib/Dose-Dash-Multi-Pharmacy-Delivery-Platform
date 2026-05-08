import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import { getProfile, updateProfile } from '../controllers/pharmacistController.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('PHARMACIST'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;

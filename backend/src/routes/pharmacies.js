import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { listAllPharmacies } from '../controllers/pharmacyController.js';

const router = express.Router();

router.get('/list', authenticate, listAllPharmacies);

export default router;

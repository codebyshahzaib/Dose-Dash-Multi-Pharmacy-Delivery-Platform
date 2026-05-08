import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { getMedicineStockInCity, findOptimizedFulfillment } from '../controllers/stockController.js';

const router = express.Router();

// Publicly check city stock (authed for patient context usually)
router.get('/medicine/:medicineId', authenticate, getMedicineStockInCity);
router.post('/optimize', authenticate, findOptimizedFulfillment);

export default router;

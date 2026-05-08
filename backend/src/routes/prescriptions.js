import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import upload from '../middleware/upload.js';
import {
  uploadPrescription,
  getMyPrescriptions,
  deletePrescription
} from '../controllers/prescriptionController.js';

const router = express.Router();

// All routes require authenticated CUSTOMER
router.use(authenticate, authorizeRoles('CUSTOMER'));

router.post('/upload', upload.single('file'), uploadPrescription);
router.get('/my', getMyPrescriptions);
router.delete('/:id', deletePrescription);

export default router;

import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import {
  getIncomingPrescriptions,
  addPrescriptionItems,
  getAlternativesBySalt,
  createProposal,
  getCustomerProposals,
  updateProposalStatus,
  getPharmacistProposals,
  searchMedicines
} from '../controllers/proposalController.js';

const router = express.Router();

router.use(authenticate);

// Pharmacist routes
router.get('/pharmacist', authorizeRoles('PHARMACIST'), getPharmacistProposals);
router.get('/pharmacist/prescriptions', authorizeRoles('PHARMACIST'), getIncomingPrescriptions);

// Transcription: Pharmacist adds items to a prescription
router.post('/prescriptions/:id/items', authorizeRoles('PHARMACIST'), addPrescriptionItems);

// Suggestions: Search global medicines and find alternatives by salt
router.get('/search-medicines', authorizeRoles('PHARMACIST'), searchMedicines);
router.get('/alternatives-by-salt', authorizeRoles('PHARMACIST'), getAlternativesBySalt);

// Submit proposal
router.post('/', authorizeRoles('PHARMACIST'), createProposal);

// Customer routes
router.get('/customer', authorizeRoles('CUSTOMER'), getCustomerProposals);
router.patch('/:id/status', authorizeRoles('CUSTOMER'), updateProposalStatus);

export default router;

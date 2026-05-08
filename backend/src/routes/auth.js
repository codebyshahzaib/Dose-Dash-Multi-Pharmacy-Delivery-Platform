import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { register, login, logout, getMe } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   logout);
router.get('/me',        authenticate, getMe);

export default router;
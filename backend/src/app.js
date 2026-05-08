import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import authenticate from './middleware/authenticate.js';

import authRoutes from './routes/auth.js';
import prescriptionRoutes from './routes/prescriptions.js';
import pharmacistRoutes from './routes/pharmacists.js';
import proposalRoutes from './routes/proposals.js';
import pharmacyRoutes from './routes/pharmacies.js';
import pharmacyOwnerRoutes from './routes/pharmacyOwner.js';
import orderRoutes from './routes/orders.js';
import riderRoutes from './routes/riders.js';
import adminRoutes from './routes/admin.js';
import inventoryRoutes from './routes/inventory.js';

dotenv.config();

const app = express();

// Custom Logger for Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

// ─── Secure File Access ─────────────────────────────────────────────
// Prescription files are NO LONGER publicly accessible.
// They must be fetched via an authenticated API route.
app.get('/api/prescriptions/view/:filename', authenticate, (req, res) => {
  const { filename } = req.params;
  // Sanitize: only allow alphanumeric, dashes, dots
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).json({ message: 'Invalid filename.' });
  }

  const filePath = path.join(process.cwd(), 'uploads', 'prescriptions', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found.' });
  }

  return res.sendFile(filePath);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/pharmacists', pharmacistRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/pharmacy-owner', pharmacyOwnerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);

// Error Handling
app.use((err, _req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size is 5 MB.' });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
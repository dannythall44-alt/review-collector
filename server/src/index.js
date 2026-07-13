import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import publicRoutes from './routes/public.js';
import stripeRoutes from './routes/stripe.js';
import { getDb } from './db.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3005;
getDb();
app.use(cors({ origin: '*', credentials: true }));
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/stripe', stripeRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'review-collector', version: '1.0.0' }));
// Serve widget script
app.use('/widget', express.static(path.join(__dirname, '..', '..', 'widget')));
// Serve client SPA
const cd = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(cd));
app.get('*', (req, res) => { if (!req.path.startsWith('/api') && !req.path.startsWith('/widget')) res.sendFile(path.join(cd, 'index.html')); });
app.listen(PORT, '0.0.0.0', () => console.log(`⭐ ReviewCollector on http://0.0.0.0:${PORT}`));
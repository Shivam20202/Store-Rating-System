import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import ownerRoutes from './routes/owner.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();


app.use(cors());

// --- Body parser ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/owner', ownerRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// --- Global error handler ---
app.use(errorHandler);

// --- Start server ---
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

export default app;
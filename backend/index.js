require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const tradesRoutes = require('./routes/trades');
const ledgerRoutes = require('./routes/ledger');
const messagesRoutes = require('./routes/messages');
const reviewsRoutes = require('./routes/reviews');
const skillVerificationRoutes = require('./routes/skillVerification');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', tradesRoutes);
app.use('/api', ledgerRoutes);
app.use('/api', messagesRoutes);
app.use('/api', reviewsRoutes);
app.use('/api', skillVerificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkillSwap backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, prisma };

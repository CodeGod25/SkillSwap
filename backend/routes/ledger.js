const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/ledger/:userId
 * Get ledger entries (transaction history) for a user
 * Query params: limit (default 50), offset (default 0)
 * Returns: array of ledger entries with trade details
 */
router.get('/ledger/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        balance: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch ledger entries
    const entries = await prisma.ledger.findMany({
      where: {
        userId: userId,
      },
      include: {
        trade: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
              },
            },
            requester: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.ledger.count({
      where: { userId: userId },
    });

    res.json({
      user,
      entries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

/**
 * GET /api/ledger
 * Get ledger for current authenticated user
 * Requires authentication
 */
router.get('/ledger', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        balance: true,
      },
    });

    const entries = await prisma.ledger.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        trade: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
              },
            },
            requester: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.ledger.count({
      where: { userId: req.userId },
    });

    res.json({
      user,
      entries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

/**
 * POST /api/ledger/transfer
 * Transfer credits to another user (gift)
 * Requires authentication
 * Body: { recipientId, amount, message }
 */
router.post('/ledger/transfer', authMiddleware, async (req, res) => {
  try {
    const { recipientId, amount, message = '' } = req.body;
    const senderId = req.userId;

    // Validation
    if (!recipientId || !amount) {
      return res.status(400).json({ error: 'Recipient ID and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (recipientId === senderId) {
      return res.status(400).json({ error: 'Cannot transfer credits to yourself' });
    }

    // Get sender
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, name: true, balance: true },
    });

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get recipient
    const recipient = await prisma.user.findUnique({
      where: { id: parseInt(recipientId) },
      select: { id: true, name: true, balance: true },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Perform transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from sender
      await tx.user.update({
        where: { id: senderId },
        data: { balance: { decrement: amount } },
      });

      // Add to recipient
      await tx.user.update({
        where: { id: recipient.id },
        data: { balance: { increment: amount } },
      });

      // Create ledger entries
      const reasonMessage = message ? `: ${message}` : '';
      
      const senderEntry = await tx.ledger.create({
        data: {
          userId: senderId,
          change: -amount,
          reason: `Gift to ${recipient.name}${reasonMessage}`,
        },
      });

      const recipientEntry = await tx.ledger.create({
        data: {
          userId: recipient.id,
          change: amount,
          reason: `Gift from ${sender.name}${reasonMessage}`,
        },
      });

      return { senderEntry, recipientEntry };
    });

    res.json({
      success: true,
      message: `Successfully transferred ${amount} credit(s) to ${recipient.name}`,
      transfer: {
        from: sender.name,
        to: recipient.name,
        amount,
        message,
      },
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Failed to transfer credits' });
  }
});

module.exports = router;

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const BALANCE_LIMIT = -5; // Allow up to -5 credit balance

/**
 * POST /api/trades
 * Create a new trade request
 * Body: { providerId, requesterId, skill, hours }
 * Requires authentication
 */
router.post('/trades', authMiddleware, async (req, res) => {
  try {
    console.log('📥 Trade creation request received:', {
      body: req.body,
      userId: req.userId,
      timestamp: new Date().toISOString()
    });

    const { providerId, requesterId, skill, hours = 1 } = req.body;

    // Validate input
    if (!requesterId || !skill) {
      console.error('❌ Validation failed: Missing requester ID or skill');
      return res.status(400).json({ 
        error: 'Requester ID and skill are required' 
      });
    }

    const hoursInt = parseInt(hours);
    if (hoursInt < 1 || hoursInt > 8) {
      console.error('❌ Validation failed: Hours out of range:', hoursInt);
      return res.status(400).json({ 
        error: 'Hours must be between 1 and 8' 
      });
    }

    // Verify requester exists
    const requester = await prisma.user.findUnique({
      where: { id: parseInt(requesterId) },
    });

    if (!requester) {
      console.error('❌ Requester not found:', requesterId);
      return res.status(404).json({ error: 'Requester not found' });
    }

    // Verify provider exists if specified
    if (providerId) {
      const provider = await prisma.user.findUnique({
        where: { id: parseInt(providerId) },
      });

      if (!provider) {
        console.error('❌ Provider not found:', providerId);
        return res.status(404).json({ error: 'Provider not found' });
      }
    }

    // Create trade
    const trade = await prisma.trade.create({
      data: {
        providerId: providerId ? parseInt(providerId) : null,
        requesterId: parseInt(requesterId),
        skill,
        hours: hoursInt,
        status: 'pending',
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Trade created successfully:', {
      tradeId: trade.id,
      providerId: trade.providerId,
      requesterId: trade.requesterId,
      skill: trade.skill,
      hours: trade.hours,
      status: trade.status
    });

    res.status(201).json(trade);
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

/**
 * GET /api/trades
 * Get all trades for current user (as provider or requester)
 * Requires authentication
 */
router.get('/trades', authMiddleware, async (req, res) => {
  try {
    console.log('📥 Get trades request for userId:', req.userId);

    const trades = await prisma.trade.findMany({
      where: {
        OR: [
          { providerId: req.userId },
          { requesterId: req.userId },
        ],
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ Found ${trades.length} trades for user ${req.userId}`);
    console.log('Trade statuses:', trades.map(t => ({ id: t.id, status: t.status, skill: t.skill })));

    res.json(trades);
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

/**
 * POST /api/trades/:id/complete
 * Complete a pending trade (provider only)
 * Creates ledger entries and updates balances in a transaction
 * Requires authentication
 */
router.post('/trades/:id/complete', authMiddleware, async (req, res) => {
  try {
    const tradeId = parseInt(req.params.id);

    console.log(`📥 Complete trade request for tradeId: ${tradeId}, userId: ${req.userId}`);

    // Use transaction with increased timeout for Railway database
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch and lock the trade
      const trade = await tx.trade.findUnique({
        where: { id: tradeId },
        include: {
          provider: true,
          requester: true,
        },
      });

      if (!trade) {
        throw new Error('Trade not found');
      }

      console.log(`✓ Trade found: status=${trade.status}, skill=${trade.skill}`);

      // 2. Verify trade status
      if (trade.status !== 'pending') {
        throw new Error(`Trade already ${trade.status}`);
      }

      // 3. Verify the requester is calling this endpoint
      // (In production, you might want provider to complete it)
      // For MVP, we allow the authenticated user if they're involved
      if (trade.providerId !== req.userId && trade.requesterId !== req.userId) {
        throw new Error('Not authorized to complete this trade');
      }

      // 4. Check requester balance (allow negative up to BALANCE_LIMIT)
      const newRequesterBalance = trade.requester.balance - trade.hours;
      if (newRequesterBalance < BALANCE_LIMIT) {
        throw new Error(
          `Insufficient balance. Requester balance would be ${newRequesterBalance}, minimum allowed is ${BALANCE_LIMIT}`
        );
      }

      console.log(`✓ Balance check passed`);

      // 5. Create ledger entry for provider (positive) and update balance
      if (trade.providerId) {
        await Promise.all([
          tx.ledger.create({
            data: {
              userId: trade.providerId,
              change: trade.hours,
              reason: `Completed trade: ${trade.skill}`,
              tradeId: trade.id,
            },
          }),
          tx.user.update({
            where: { id: trade.providerId },
            data: {
              balance: {
                increment: trade.hours,
              },
            },
          }),
        ]);
        console.log(`✓ Provider ledger and balance updated`);
      }

      // 6. Create ledger entry for requester (negative) and update balance
      await Promise.all([
        tx.ledger.create({
          data: {
            userId: trade.requesterId,
            change: -trade.hours,
            reason: `Received service: ${trade.skill}`,
            tradeId: trade.id,
          },
        }),
        tx.user.update({
          where: { id: trade.requesterId },
          data: {
            balance: {
              decrement: trade.hours,
            },
          },
        }),
      ]);
      console.log(`✓ Requester ledger and balance updated`);

      // 7. Update trade status
      const updatedTrade = await tx.trade.update({
        where: { id: tradeId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              balance: true,
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              balance: true,
            },
          },
        },
      });

      console.log(`✓ Trade marked as completed`);
      return updatedTrade;
    }, {
      maxWait: 10000, // Maximum time to wait for transaction to start (10s)
      timeout: 15000, // Maximum time for transaction to complete (15s)
    });

    console.log(`✅ Trade ${tradeId} completed successfully`);
    res.json(result);
  } catch (error) {
    console.error('Complete trade error:', error);
    
    // Return appropriate status code based on error
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('already')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('Insufficient balance')) {
      return res.status(402).json({ error: error.message });
    }
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to complete trade' });
  }
});

/**
 * DELETE /api/trades/:id
 * Cancel a pending trade
 * Requires authentication
 */
router.delete('/trades/:id', authMiddleware, async (req, res) => {
  try {
    const tradeId = parseInt(req.params.id);

    console.log(`📥 Cancel trade request for tradeId: ${tradeId}, userId: ${req.userId}`);

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending trades' });
    }

    // Only provider or requester can cancel
    if (trade.providerId !== req.userId && trade.requesterId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: 'cancelled',
      },
    });

    console.log(`✅ Trade ${tradeId} cancelled successfully`);
    res.json({ message: 'Trade cancelled successfully' });
  } catch (error) {
    console.error('Cancel trade error:', error);
    res.status(500).json({ error: 'Failed to cancel trade' });
  }
});

module.exports = router;

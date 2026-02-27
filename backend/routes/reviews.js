const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/reviews
 * Submit a review for a completed trade
 * Body: { tradeId, revieweeId, rating (1-5), comment (optional) }
 */
router.post('/reviews', authMiddleware, async (req, res) => {
  try {
    const { tradeId, revieweeId, rating, comment } = req.body;

    console.log('📥 Submit review request:', {
      reviewerId: req.userId,
      revieweeId,
      tradeId,
      rating
    });

    // Validate input
    if (!tradeId || !revieweeId || !rating) {
      return res.status(400).json({ error: 'Trade ID, reviewee ID, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if trade exists and is completed
    const trade = await prisma.trade.findUnique({
      where: { id: parseInt(tradeId) }
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (trade.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed trades' });
    }

    // Verify user was part of this trade
    if (trade.providerId !== req.userId && trade.requesterId !== req.userId) {
      return res.status(403).json({ error: 'You were not part of this trade' });
    }

    // Verify reviewee was the other party
    const expectedRevieweeId = trade.providerId === req.userId ? trade.requesterId : trade.providerId;
    if (parseInt(revieweeId) !== expectedRevieweeId) {
      return res.status(400).json({ error: 'Invalid reviewee for this trade' });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        tradeId_reviewerId: {
          tradeId: parseInt(tradeId),
          reviewerId: req.userId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this trade' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId: req.userId,
        revieweeId: parseInt(revieweeId),
        tradeId: parseInt(tradeId),
        rating: parseInt(rating),
        comment: comment?.trim() || null
      },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        reviewee: {
          select: { id: true, name: true, email: true }
        },
        trade: {
          select: { id: true, skill: true, completedAt: true }
        }
      }
    });

    // Update reviewee's rating
    await updateUserRating(parseInt(revieweeId));

    console.log(`✅ Review created: id=${review.id}`);
    res.status(201).json(review);
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

/**
 * GET /api/reviews/:userId
 * Get all reviews for a specific user
 */
router.get('/reviews/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: userId
      },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        trade: {
          select: { id: true, skill: true, completedAt: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate rating stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    res.json({
      reviews,
      stats: {
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(2)),
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * GET /api/reviews/trade/:tradeId/check
 * Check if current user has reviewed a specific trade
 */
router.get('/reviews/trade/:tradeId/check', authMiddleware, async (req, res) => {
  try {
    const tradeId = parseInt(req.params.tradeId);

    const review = await prisma.review.findUnique({
      where: {
        tradeId_reviewerId: {
          tradeId,
          reviewerId: req.userId
        }
      }
    });

    res.json({ hasReviewed: !!review, review });
  } catch (error) {
    console.error('Check review error:', error);
    res.status(500).json({ error: 'Failed to check review' });
  }
});

/**
 * GET /api/reviews/pending
 * Get trades that need reviews from current user
 */
router.get('/reviews/pending', authMiddleware, async (req, res) => {
  try {
    // Get completed trades where user was involved
    const completedTrades = await prisma.trade.findMany({
      where: {
        OR: [
          { providerId: req.userId },
          { requesterId: req.userId }
        ],
        status: 'completed'
      },
      include: {
        provider: {
          select: { id: true, name: true, email: true }
        },
        requester: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Check which trades have been reviewed
    const tradesNeedingReview = [];
    
    for (const trade of completedTrades) {
      const existingReview = await prisma.review.findUnique({
        where: {
          tradeId_reviewerId: {
            tradeId: trade.id,
            reviewerId: req.userId
          }
        }
      });

      if (!existingReview) {
        // Determine who to review
        const reviewee = trade.providerId === req.userId ? trade.requester : trade.provider;
        tradesNeedingReview.push({
          ...trade,
          reviewee
        });
      }
    }

    res.json(tradesNeedingReview);
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
});

/**
 * Helper function to update user's average rating
 */
async function updateUserRating(userId) {
  try {
    // Calculate average rating from all reviews
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      select: { rating: true }
    });

    if (reviews.length === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { rating: 0.0 }
      });
      return;
    }

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.user.update({
      where: { id: userId },
      data: { rating: parseFloat(averageRating.toFixed(2)) }
    });

    console.log(`✅ Updated user ${userId} rating to ${averageRating.toFixed(2)}`);
  } catch (error) {
    console.error('Update rating error:', error);
  }
}

module.exports = router;

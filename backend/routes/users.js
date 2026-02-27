const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/location/detect
 * Detect user's approximate location based on IP
 * Returns city, country, lat, lng (approximate)
 */
router.get('/location/detect', async (req, res) => {
  try {
    // Get IP from request
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress;
    
    // For local development, return a default location (NYC)
    if (ip === '::1' || ip === '127.0.0.1' || ip?.includes('192.168') || ip?.includes('localhost')) {
      return res.json({
        city: 'New York',
        country: 'United States',
        lat: 40.7580,
        lng: -73.9855,
        source: 'default',
        message: 'Local development - using default NYC coordinates'
      });
    }

    // In production, you could use a service like ipapi.co or ip-api.com
    // For now, return default location
    res.json({
      city: 'New York',
      country: 'United States',
      lat: 40.7580,
      lng: -73.9855,
      source: 'default',
      message: 'Using default coordinates. Enable browser geolocation for accuracy.'
    });
  } catch (error) {
    console.error('Location detection error:', error);
    res.status(500).json({ error: 'Failed to detect location' });
  }
});

/**
 * GET /api/me
 * Get current user profile with skills
 * Requires authentication
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        lat: true,
        lng: true,
        radiusKm: true,
        balance: true,
        rating: true,
        totalHelps: true,
        createdAt: true,
        updatedAt: true,
        skills: {
          select: {
            id: true,
            name: true,
            kind: true,
            level: true,
            yearsOfExp: true,
            isVerified: true,
            verifiedBy: true,
            verificationStatus: true,
            proofUrl: true,
            proofType: true,
            proofDescription: true,
            verificationNotes: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/me
 * Update current user profile and skills
 * Body: { name?, lat?, lng?, radiusKm?, skills? }
 * Requires authentication
 */
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, lat, lng, radiusKm, skills } = req.body;

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (lat !== undefined) updateData.lat = lat ? parseFloat(lat) : null;
    if (lng !== undefined) updateData.lng = lng ? parseFloat(lng) : null;
    if (radiusKm !== undefined) updateData.radiusKm = parseInt(radiusKm);

    // Update user profile
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        lat: true,
        lng: true,
        radiusKm: true,
        balance: true,
      },
    });

    // Update skills if provided
    if (Array.isArray(skills)) {
      // Delete existing skills
      await prisma.skill.deleteMany({
        where: { userId: req.userId },
      });

      // Create new skills
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map((skill) => ({
            userId: req.userId,
            name: skill.name,
            kind: skill.kind, // "offer" or "need"
          })),
        });
      }
    }

    // Fetch updated user with skills
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { skills: true },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/users/nearby
 * Find users near a location
 * Query: lat, lng, radiusKm (default 5), search (optional skill filter)
 * Returns: array of nearby users with their offered skills
 */
router.get('/users/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5, search } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radius = parseFloat(radiusKm);

    // Simple bounding box calculation (approximate, no PostGIS needed for MVP)
    // 1 degree latitude ≈ 111 km
    // 1 degree longitude ≈ 111 km * cos(latitude)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((userLat * Math.PI) / 180));

    const minLat = userLat - latDelta;
    const maxLat = userLat + latDelta;
    const minLng = userLng - lngDelta;
    const maxLng = userLng + lngDelta;

    // Find users in bounding box
    let users = await prisma.user.findMany({
      where: {
        lat: {
          gte: minLat,
          lte: maxLat,
        },
        lng: {
          gte: minLng,
          lte: maxLng,
        },
      },
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
        balance: true,
        rating: true,
        totalHelps: true,
        skills: {
          select: {
            id: true,
            name: true,
            kind: true,
            level: true,
            yearsOfExp: true,
            isVerified: true,
            verificationStatus: true,
            proofUrl: true,
            proofType: true,
          },
        },
      },
    });

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter((user) =>
        user.skills.some((skill) =>
          skill.name.toLowerCase().includes(searchLower)
        )
      );
    }

    // Calculate actual distance for each user (Haversine formula)
    users = users.map((user) => {
      const distance = calculateDistance(userLat, userLng, user.lat, user.lng);
      return { ...user, distance: Math.round(distance * 10) / 10 };
    });

    // Sort by distance
    users.sort((a, b) => a.distance - b.distance);

    res.json(users);
  } catch (error) {
    console.error('Nearby users error:', error);
    res.status(500).json({ error: 'Failed to find nearby users' });
  }
});

/**
 * GET /api/users/:id
 * Get a specific user's public profile
 * Returns user basic info and skills (for starting conversations)
 */
router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        lat: true,
        lng: true,
        rating: true,
        totalHelps: true,
        skills: {
          select: {
            id: true,
            name: true,
            kind: true,
            level: true,
            yearsOfExp: true,
            isVerified: true,
            verifiedBy: true,
            verificationStatus: true,
            proofUrl: true,
            proofType: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * GET /api/stats/weekly-helps
 * Get count of neighbors helped this week (completed trades where user was provider)
 * Requires authentication
 */
router.get('/stats/weekly-helps', authMiddleware, async (req, res) => {
  try {
    // Calculate date 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Count completed trades where user was the provider in the last 7 days
    const weeklyHelps = await prisma.trade.count({
      where: {
        providerId: req.userId,
        status: 'completed',
        completedAt: {
          gte: oneWeekAgo,
        },
      },
    });

    res.json({ weeklyHelps });
  } catch (error) {
    console.error('Weekly helps stats error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly helps stats' });
  }
});

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * POST /api/skills/:skillId/verify
 * Request verification for a skill (self-verification for now)
 * In production, this would trigger admin review or peer verification
 */
router.post('/skills/:skillId/verify', authMiddleware, async (req, res) => {
  try {
    const { skillId } = req.params;
    const { yearsOfExp } = req.body;

    // Verify the skill belongs to the current user
    const skill = await prisma.skill.findFirst({
      where: {
        id: parseInt(skillId),
        userId: req.userId,
        kind: 'offer', // Only offered skills can be verified
      },
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found or not owned by you' });
    }

    // Update skill with verification
    const updatedSkill = await prisma.skill.update({
      where: { id: parseInt(skillId) },
      data: {
        isVerified: true,
        verifiedBy: 'Self-verified',
        yearsOfExp: yearsOfExp || skill.yearsOfExp,
      },
    });

    res.json(updatedSkill);
  } catch (error) {
    console.error('Skill verification error:', error);
    res.status(500).json({ error: 'Failed to verify skill' });
  }
});

/**
 * PUT /api/skills/:skillId/level
 * Update skill level and experience
 */
router.put('/skills/:skillId/level', authMiddleware, async (req, res) => {
  try {
    const { skillId } = req.params;
    const { level, yearsOfExp } = req.body;

    // Verify the skill belongs to the current user
    const skill = await prisma.skill.findFirst({
      where: {
        id: parseInt(skillId),
        userId: req.userId,
      },
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Validate level
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (level && !validLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid level. Must be: Beginner, Intermediate, Advanced, or Expert' });
    }

    // Update skill
    const updatedSkill = await prisma.skill.update({
      where: { id: parseInt(skillId) },
      data: {
        ...(level && { level }),
        ...(yearsOfExp !== undefined && { yearsOfExp: parseInt(yearsOfExp) }),
      },
    });

    res.json(updatedSkill);
  } catch (error) {
    console.error('Skill level update error:', error);
    res.status(500).json({ error: 'Failed to update skill level' });
  }
});

module.exports = router;

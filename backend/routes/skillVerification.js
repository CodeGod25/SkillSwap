const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/skills/verify-request
 * Request verification for a skill (admin or peer)
 * Body: { skillId, verificationType: 'admin' | 'peer', notes, proofUrl, proofType, proofDescription }
 */
router.post('/skills/verify-request', authMiddleware, async (req, res) => {
  try {
    const { skillId, verificationType = 'peer', notes, proofUrl, proofType, proofDescription } = req.body;

    console.log('📥 Verification request:', {
      userId: req.userId,
      skillId,
      verificationType,
      hasProof: !!proofUrl || !!proofDescription
    });

    // Validate input
    if (!skillId) {
      return res.status(400).json({ error: 'Skill ID is required' });
    }
    
    // Require proof for verification request
    if (!proofUrl && !proofDescription) {
      return res.status(400).json({ 
        error: 'Proof is required for skill verification',
        message: 'Please provide either a proof link (certificate, portfolio) or a description of your proof'
      });
    }

    // Check if skill exists and belongs to user
    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(skillId) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    if (skill.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only request verification for your own skills' });
    }

    if (skill.isVerified) {
      return res.status(400).json({ error: 'Skill is already verified' });
    }

    // Update skill with proof information
    const updatedSkill = await prisma.skill.update({
      where: { id: parseInt(skillId) },
      data: {
        proofUrl: proofUrl || null,
        proofType: proofType || null,
        proofDescription: proofDescription || null,
        verificationStatus: 'pending'
      }
    });

    console.log(`📝 Skill ${skillId} proof saved, checking auto-verification...`);

    // For now, auto-verify expert level skills with 5+ years experience
    if (skill.level === 'expert' && skill.yearsOfExp >= 5) {
      await prisma.skill.update({
        where: { id: parseInt(skillId) },
        data: {
          isVerified: true,
          verifiedBy: 'Auto-verified: Expert (5+ years)',
          verificationStatus: 'verified',
          verificationNotes: 'Automatically verified based on expert level and 5+ years experience.'
        }
      });

      console.log(`✅ Skill ${skillId} auto-verified`);
      return res.json({
        status: 'auto-verified',
        message: 'Skill auto-verified based on experience',
        skill: await prisma.skill.findUnique({ where: { id: parseInt(skillId) } })
      });
    }

    // Intermediate/Advanced with 2+ years auto-verify
    if ((skill.level === 'intermediate' || skill.level === 'advanced') && skill.yearsOfExp >= 2) {
      await prisma.skill.update({
        where: { id: parseInt(skillId) },
        data: {
          isVerified: true,
          verifiedBy: 'Auto-verified: Experienced',
          verificationStatus: 'verified',
          verificationNotes: 'Automatically verified based on experience level and 2+ years.'
        }
      });

      console.log(`✅ Skill ${skillId} auto-verified`);
      return res.json({
        status: 'auto-verified',
        message: 'Skill auto-verified based on experience level',
        skill: await prisma.skill.findUnique({ where: { id: parseInt(skillId) } })
      });
    }

    // Otherwise, require manual peer verification
    console.log(`⏳ Skill ${skillId} pending peer verification`);
    res.json({
      status: 'pending',
      message: 'Verification request submitted with proof. A community member with high rating will review your skill.',
      skill: updatedSkill
    });
  } catch (error) {
    console.error('Verification request error:', error);
    res.status(500).json({ error: 'Failed to request verification' });
  }
});

/**
 * POST /api/skills/:skillId/verify
 * Verify another user's skill (admin or peer with authority)
 * Body: { verificationNote }
 */
router.post('/skills/:skillId/verify', authMiddleware, async (req, res) => {
  try {
    const skillId = parseInt(req.params.skillId);
    const { verificationNote } = req.body;

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        user: {
          select: { id: true, name: true, rating: true }
        }
      }
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    if (skill.isVerified) {
      return res.status(400).json({ error: 'Skill is already verified' });
    }

    // Get verifier info
    const verifier = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, rating: true }
    });

    // Check if verifier has authority (high rating or admin)
    const canVerify = verifier.rating >= 4.5 || req.userId === 1; // User ID 1 is admin

    if (!canVerify) {
      return res.status(403).json({ 
        error: 'You need a rating of 4.5+ to verify skills' 
      });
    }

    // Verify the skill
    const updatedSkill = await prisma.skill.update({
      where: { id: skillId },
      data: {
        isVerified: true,
        verifiedBy: verificationNote || `Verified by ${verifier.name}`
      }
    });

    console.log(`✅ Skill ${skillId} verified by user ${req.userId}`);
    res.json({
      message: 'Skill verified successfully',
      skill: updatedSkill
    });
  } catch (error) {
    console.error('Skill verification error:', error);
    res.status(500).json({ error: 'Failed to verify skill' });
  }
});

/**
 * GET /api/skills/verification-eligible
 * Get skills that current user can verify (based on their expertise)
 */
router.get('/skills/verification-eligible', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        skills: true
      }
    });

    if (!user || user.rating < 4.5) {
      return res.json([]);
    }

    // Find unverified skills in categories where user has expertise
    const userSkillCategories = user.skills
      .filter(s => s.level === 'expert' || s.level === 'advanced')
      .map(s => s.name.toLowerCase());

    const eligibleSkills = await prisma.skill.findMany({
      where: {
        isVerified: false,
        userId: { not: req.userId },
        OR: userSkillCategories.map(category => ({
          name: { contains: category, mode: 'insensitive' }
        }))
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, rating: true }
        }
      },
      take: 10
    });

    res.json(eligibleSkills);
  } catch (error) {
    console.error('Get eligible skills error:', error);
    res.status(500).json({ error: 'Failed to fetch eligible skills' });
  }
});

/**
 * POST /api/skills/:skillId/ai-verify
 * Use AI to analyze proof and suggest verification
 * Body: none (uses existing proof data)
 */
router.post('/skills/:skillId/ai-verify', authMiddleware, async (req, res) => {
  try {
    const skillId = parseInt(req.params.skillId);
    const OpenAI = require('openai');

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: 'AI verification is not configured',
        message: 'OpenAI API key is missing'
      });
    }

    // Get the skill with proof
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        user: {
          select: { id: true, name: true, rating: true, totalHelps: true }
        }
      }
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Get verifier info to check authority
    const verifier = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { rating: true }
    });

    // Only high-rated users or skill owner can request AI verification
    const canUseAI = verifier.rating >= 4.0 || skill.userId === req.userId;

    if (!canUseAI) {
      return res.status(403).json({ 
        error: 'You need a rating of 4.0+ to use AI verification' 
      });
    }

    // Check if skill has proof
    if (!skill.proofUrl && !skill.proofDescription) {
      return res.status(400).json({ 
        error: 'No proof available to analyze',
        message: 'Please add proof before requesting AI verification'
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Prepare proof data for AI analysis
    const proofData = {
      skillName: skill.name,
      level: skill.level,
      yearsOfExp: skill.yearsOfExp,
      proofUrl: skill.proofUrl,
      proofType: skill.proofType,
      proofDescription: skill.proofDescription,
      userRating: skill.user.rating,
      userTotalHelps: skill.user.totalHelps
    };

    // AI analysis prompt
    const prompt = `You are an expert skill verifier analyzing proof of competency. 

Skill Information:
- Skill: ${proofData.skillName}
- Claimed Level: ${proofData.level}
- Years of Experience: ${proofData.yearsOfExp}
- Proof Type: ${proofData.proofType || 'Not specified'}
- Proof URL: ${proofData.proofUrl || 'None'}
- Proof Description: ${proofData.proofDescription || 'None'}
- User Rating: ${proofData.userRating}/5.0
- User's Completed Trades: ${proofData.userTotalHelps}

Analyze this proof and provide:
1. Verification Recommendation: VERIFY, PENDING, or REJECT
2. Confidence Level: HIGH, MEDIUM, or LOW
3. Detailed Reasoning (2-3 sentences)
4. Suggestions for improvement (if not verified)

Respond in JSON format:
{
  "recommendation": "VERIFY|PENDING|REJECT",
  "confidence": "HIGH|MEDIUM|LOW",
  "reasoning": "Your detailed analysis",
  "suggestions": "Suggestions for improvement or empty if verified"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional skill verification analyst. Be thorough but fair in your assessments.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    // If AI recommends VERIFY with HIGH confidence, auto-verify
    if (analysis.recommendation === 'VERIFY' && analysis.confidence === 'HIGH') {
      await prisma.skill.update({
        where: { id: skillId },
        data: {
          isVerified: true,
          verifiedBy: 'AI-verified',
          verificationStatus: 'verified',
          verificationNotes: `AI Analysis (${analysis.confidence} confidence): ${analysis.reasoning}`
        }
      });

      console.log(`🤖✅ Skill ${skillId} AI-verified`);
      
      return res.json({
        status: 'verified',
        message: 'Skill verified by AI analysis',
        analysis,
        skill: await prisma.skill.findUnique({ where: { id: skillId } })
      });
    }

    // Otherwise, return analysis without verifying
    console.log(`🤖⏳ Skill ${skillId} AI analysis: ${analysis.recommendation}`);
    
    res.json({
      status: 'analyzed',
      message: 'AI analysis completed',
      analysis,
      skill
    });
  } catch (error) {
    console.error('AI verification error:', error);
    res.status(500).json({ 
      error: 'AI verification failed',
      message: error.message 
    });
  }
});

module.exports = router;

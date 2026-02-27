const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI with API key from env
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// In-memory rate limiting (simple implementation)
const rateLimits = new Map();
const RATE_LIMIT = 10; // Max 10 requests per user per day
const RATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);
  
  if (!userLimit) {
    rateLimits.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (now > userLimit.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: userLimit.resetAt };
  }
  
  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT - userLimit.count };
}

// POST /api/ai/proofread - Proofread and improve text
router.post('/proofread', async (req, res) => {
  try {
    const { text, context = 'general' } = req.body;
    const userId = req.user.id;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 2000) {
      return res.status(400).json({ error: 'Text too long (max 2000 characters)' });
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt);
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Try again tomorrow.',
        resetAt: resetDate.toISOString()
      });
    }
    
    // If OpenAI is not configured, return mock suggestions
    if (!openai) {
      console.warn('OpenAI API key not configured, returning mock suggestions');
      return res.json({
        original: text,
        improved: text,
        suggestions: [
          {
            type: 'info',
            message: 'AI proofreading is not configured. Please add OPENAI_API_KEY to .env file.'
          }
        ],
        remaining: rateLimit.remaining
      });
    }
    
    // Build context-specific prompt
    let systemPrompt = 'You are a helpful writing assistant that improves text clarity, grammar, and tone.';
    let userPrompt = `Please proofread and improve the following text. Return your response in JSON format with these fields:
- improved: The improved version of the text
- suggestions: An array of objects with "type" (grammar/clarity/tone/style) and "message" (specific suggestion)

Text to improve:
${text}`;
    
    if (context === 'review') {
      systemPrompt = 'You are a helpful assistant that improves review comments to be constructive, respectful, and specific.';
      userPrompt = `Please improve this review comment to be more constructive, specific, and respectful while maintaining the original sentiment. ${userPrompt}`;
    } else if (context === 'skill') {
      systemPrompt = 'You are a helpful assistant that improves skill descriptions to be clear, professional, and highlight expertise.';
      userPrompt = `Please improve this skill description to be more professional and highlight key competencies. ${userPrompt}`;
    } else if (context === 'trade') {
      systemPrompt = 'You are a helpful assistant that improves trade request messages to be clear, polite, and professional.';
      userPrompt = `Please improve this trade request message to be clearer and more professional. ${userPrompt}`;
    }
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const response = completion.choices[0].message.content;
    
    // Try to parse JSON response
    let result;
    try {
      result = JSON.parse(response);
    } catch (e) {
      // If not valid JSON, treat entire response as improved text
      result = {
        improved: response,
        suggestions: [{
          type: 'general',
          message: 'Text has been improved for clarity and tone.'
        }]
      };
    }
    
    res.json({
      original: text,
      improved: result.improved || text,
      suggestions: result.suggestions || [],
      remaining: rateLimit.remaining
    });
    
  } catch (error) {
    console.error('AI proofreading error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({ 
        error: 'AI service quota exceeded. Please try again later.' 
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'AI service rate limit exceeded. Please try again in a moment.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to process text' });
  }
});

// GET /api/ai/usage - Get current rate limit usage
router.get('/usage', async (req, res) => {
  try {
    const userId = req.user.id;
    const userLimit = rateLimits.get(userId);
    
    if (!userLimit) {
      return res.json({
        used: 0,
        remaining: RATE_LIMIT,
        limit: RATE_LIMIT,
        resetAt: new Date(Date.now() + RATE_WINDOW).toISOString()
      });
    }
    
    const now = Date.now();
    if (now > userLimit.resetAt) {
      return res.json({
        used: 0,
        remaining: RATE_LIMIT,
        limit: RATE_LIMIT,
        resetAt: new Date(now + RATE_WINDOW).toISOString()
      });
    }
    
    res.json({
      used: userLimit.count,
      remaining: RATE_LIMIT - userLimit.count,
      limit: RATE_LIMIT,
      resetAt: new Date(userLimit.resetAt).toISOString()
    });
    
  } catch (error) {
    console.error('Failed to get usage:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

module.exports = router;

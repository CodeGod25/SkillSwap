const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/messages/conversations
 * Get all conversations (unique users user has messaged with)
 * Returns list with last message preview and unread count
 */
router.get('/messages/conversations', authMiddleware, async (req, res) => {
  try {
    console.log('📥 Get conversations request for userId:', req.userId);

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group messages by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.senderId === req.userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === req.userId ? msg.receiver : msg.sender;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          partnerEmail: partner.email,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          lastMessageSenderId: msg.senderId,
          unreadCount: 0,
          messages: []
        });
      }
      
      const conversation = conversationsMap.get(partnerId);
      conversation.messages.push(msg);
      
      // Count unread messages from partner
      if (msg.receiverId === req.userId && !msg.isRead) {
        conversation.unreadCount++;
      }
    });

    // Convert map to array and sort by last message time
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    console.log(`✅ Found ${conversations.length} conversations`);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /api/messages/:userId
 * Get all messages between current user and specified user
 */
router.get('/messages/:userId', authMiddleware, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    console.log(`📥 Get messages between ${req.userId} and ${otherUserId}`);

    // Get messages between these two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages from other user as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: req.userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    console.log(`✅ Found ${messages.length} messages, marked unread as read`);
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/messages
 * Send a new message
 * Body: { receiverId, content, tradeId (optional) }
 */
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content, tradeId } = req.body;

    console.log('📥 Send message request:', {
      senderId: req.userId,
      receiverId,
      contentLength: content?.length,
      tradeId
    });

    // Validate input
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Cannot message yourself
    if (parseInt(receiverId) === req.userId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: req.userId,
        receiverId: parseInt(receiverId),
        content: content.trim(),
        tradeId: tradeId ? parseInt(tradeId) : null
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`✅ Message sent: id=${message.id}`);
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * GET /api/messages/unread/count
 * Get count of unread messages
 */
router.get('/messages/unread/count', authMiddleware, async (req, res) => {
  try {
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: req.userId,
        isRead: false
      }
    });

    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

/**
 * PUT /api/messages/:id/read
 * Mark a message as read
 */
router.put('/messages/:id/read', authMiddleware, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only receiver can mark as read
    if (message.receiverId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

module.exports = router;

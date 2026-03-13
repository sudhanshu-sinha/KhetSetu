const Chat = require('../models/Chat');

/**
 * Get or create a chat between two users
 * POST /api/chat/start
 */
exports.getOrCreateChat = async (req, res, next) => {
  try {
    const { userId, jobId } = req.body;

    if (userId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, userId] }
    }).populate('participants', 'name phone profilePhoto role');

    if (!chat) {
      chat = new Chat({
        participants: [req.userId, userId],
        messages: [],
        job: jobId || undefined
      });
      await chat.save();
      await chat.populate('participants', 'name phone profilePhoto role');
    }

    res.json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message in a chat
 * POST /api/chat/:chatId/message
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Verify user is a participant
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Not a participant of this chat' });
    }

    const message = {
      sender: req.userId,
      text,
      read: false
    };

    chat.messages.push(message);
    chat.lastMessage = {
      text,
      sender: req.userId,
      timestamp: new Date()
    };
    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    // Emit to other participant via Socket.io
    const io = req.app.get('io');
    if (io) {
      const otherUser = chat.participants.find(p => p.toString() !== req.userId.toString());
      io.to(otherUser.toString()).emit('new-message', {
        chatId: chat._id,
        message: savedMessage,
        senderName: req.user.name
      });
    }

    res.json({ success: true, message: savedMessage });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all chats for current user
 * GET /api/chat
 */
exports.getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.userId
    })
      .populate('participants', 'name phone profilePhoto role')
      .populate('job', 'title category')
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat messages
 * GET /api/chat/:chatId/messages
 */
exports.getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    // Paginate messages (latest first)
    const start = Math.max(0, chat.messages.length - parseInt(page) * parseInt(limit));
    const end = chat.messages.length - (parseInt(page) - 1) * parseInt(limit);
    const messages = chat.messages.slice(Math.max(0, start), end);

    res.json({
      success: true,
      messages,
      hasMore: start > 0
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark messages as read
 * PUT /api/chat/:chatId/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    let updated = false;
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== req.userId.toString() && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });

    if (updated) await chat.save();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

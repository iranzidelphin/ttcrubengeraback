import { ChatMessage } from '../models/ChatMessage.js';
import { User } from '../models/User.js';
import { serializeChatMessage, serializeUser } from '../utils/serializers.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

function getAudienceFromRole(role) {
  return role === 'teacher' ? 'teacher' : 'parent';
}

export async function listAdminConversations(req, res) {
  const audience = req.params.audience;

  if (!['teacher', 'parent'].includes(audience)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid audience.',
    });
  }

  const users = await User.find({ role: audience }).select('-password').sort({ firstName: 1 });
  const messages = await ChatMessage.find({ audience })
    .populate('sender', 'firstName lastName email role')
    .populate('recipient', 'firstName lastName email role')
    .sort({ createdAt: 1 });

  const conversations = users.map((user) => {
    const history = messages
      .filter(
        (message) =>
          message.sender._id.toString() === user._id.toString() ||
          message.recipient._id.toString() === user._id.toString()
      )
      .map(serializeChatMessage);

    return {
      user: serializeUser(user),
      lastMessage: history.at(-1) || null,
      messages: history,
    };
  });

  res.status(200).json({
    success: true,
    conversations,
  });
}

export async function listMessagesWithAdmin(req, res) {
  const admin = await User.findOne({ role: 'admin' }).select('-password');

  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'Admin account not found.',
    });
  }

  const messages = await ChatMessage.find({
    audience: getAudienceFromRole(req.user.role),
    $or: [
      { sender: req.user._id, recipient: admin._id },
      { sender: admin._id, recipient: req.user._id },
    ],
  })
    .populate('sender', 'firstName lastName email role')
    .populate('recipient', 'firstName lastName email role')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    admin: serializeUser(admin),
    messages: messages.map(serializeChatMessage),
  });
}

export async function sendMessage(req, res) {
  try {
    const { recipientId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required.',
      });
    }

    let recipient;
    let audience;

    if (req.user.role === 'admin') {
      recipient = await User.findById(recipientId).select('-password');

      if (!recipient || !['teacher', 'parent'].includes(recipient.role)) {
        return res.status(400).json({
          success: false,
          error: 'Admin can only chat with teachers or parents.',
        });
      }

      audience = recipient.role;
    } else if (['teacher', 'parent'].includes(req.user.role)) {
      recipient = await User.findOne({ role: 'admin' }).select('-password');

      if (!recipient) {
        return res.status(404).json({
          success: false,
          error: 'Admin account not found.',
        });
      }

      audience = req.user.role;
    } else {
      return res.status(403).json({
        success: false,
        error: 'Only admin, teachers, and parents can use chat.',
      });
    }

    const message = await ChatMessage.create({
      sender: req.user._id,
      recipient: recipient._id,
      content: content.trim(),
      audience,
    });

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('sender', 'firstName lastName email role')
      .populate('recipient', 'firstName lastName email role');

    const payload = serializeChatMessage(populatedMessage);

    req.app.get('io').to(`user:${req.user._id.toString()}`).emit(SOCKET_EVENTS.CHAT_MESSAGE, payload);
    req.app.get('io').to(`user:${recipient._id.toString()}`).emit(SOCKET_EVENTS.CHAT_MESSAGE, payload);

    res.status(201).json({
      success: true,
      message: payload,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not send message.',
    });
  }
}

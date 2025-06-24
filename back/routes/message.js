const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Exchange = require('../models/Mexchange');
const { authenticateJWT } = require('../middleware/authenticate');

router.get('/contacts', authenticateJWT, async (req, res) => {
  const me = req.user.userId;
  const sentTo = await Message.distinct('to', { from: me });
  const receivedFrom = await Message.distinct('from', { to: me });
  const contactIds = Array.from(new Set([...sentTo, ...receivedFrom]))
    .filter(id => id.toString() !== me);

  const contacts = await Promise.all(contactIds.map(async contactId => {
    let exch = await Exchange.findOne({
      participants: { $all: [me, contactId] }
    });
    if (!exch) exch = await Exchange.create({
      participants: [me, contactId]
    });

    const lastMsg = await Message.findOne({
      exchangeId: exch._id,
      from: contactId
    }).sort({ sentAt: -1 }).lean();

    const unreadCount = await Message.countDocuments({
      exchangeId: exch._id,
      to: me,
      readAt: { $exists: false }
    });

    const user = await User.findById(contactId, 'username profilePicture').lean();

    return {
      conversationId: exch._id,
      _id:            user._id,
      username:       user.username,
      profilePicture: user.profilePicture,
      lastMessage:    lastMsg ? lastMsg.content : '',
      updatedAt:      lastMsg ? lastMsg.sentAt : exch.createdAt,
      unreadCount
    };
  }));

  res.json({ contacts });
});

router.get('/history/:otherUserId', authenticateJWT, async (req, res) => {
  const me = req.user.userId;
  const them = req.params.otherUserId;
  let exch = await Exchange.findOne({
    participants: { $all: [me, them] }
  });
  if (!exch) return res.json({ messages: [] });

  await Message.updateMany({
    exchangeId: exch._id,
    to: me,
    readAt: { $exists: false }
  }, { readAt: new Date() });

  const messages = await Message
    .find({ exchangeId: exch._id })
    .sort({ sentAt: 1 });

  res.json({ messages });
});

router.put('/:id/read', authenticateJWT, async (req, res) => {
  const msg = await Message.findByIdAndUpdate(
    req.params.id,
    { readAt: new Date() },
    { new: true }
  );
  res.json({ message: msg });
});

router.post('/', authenticateJWT, async (req, res) => {
  const from = req.user.userId;
  const { to, content } = req.body;
  let exch = await Exchange.findOne({
    participants: { $all: [from, to] }
  });
  if (!exch) exch = await Exchange.create({
    participants: [from, to]
  });

  const msg = await Message.create({
    exchangeId: exch._id,
    from,
    to,
    content,
    sentAt: new Date()
  });

  res.status(201).json({ message: msg });
});

module.exports = router;

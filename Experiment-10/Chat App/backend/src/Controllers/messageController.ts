import type { Response } from 'express';
import Message from '../Models/Message.js';
import User from '../Models/User.js';
import Chat from '../Models/Chat.js';

export const allMessages = async (req: any, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name pic email')
      .populate('chat');
    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const sendMessage = async (req: any, res: Response): Promise<void> => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log('Invalid data passed into request');
    res.sendStatus(400);
    return;
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'name pic');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name pic email',
    }) as any;

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

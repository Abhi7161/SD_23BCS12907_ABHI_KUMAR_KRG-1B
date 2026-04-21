import type { Response } from 'express';
import Chat from '../Models/Chat.js';
import User from '../Models/User.js';

export const accessChat = async (req: any, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    console.log('UserId param not sent with request');
    res.sendStatus(400);
    return;
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic email',
  }) as any;

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(FullChat);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};

export const fetchChats = async (req: any, res: Response): Promise<void> => {
  try {
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: 'latestMessage.sender',
      select: 'name pic email',
    }) as any;

    res.status(200).send(results);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createGroupChat = async (req: any, res: Response): Promise<void> => {
  if (!req.body.users || !req.body.name) {
    res.status(400).send({ message: 'Please Fill all the feilds' });
    return;
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 1) {
    res.status(400).json({ message: 'At least 1 other user is required to form a group chat' });
    return;
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

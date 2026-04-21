import type { Request, Response } from 'express';
import User from '../Models/User.js';
import generateToken from '../Utils/generateToken.js';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, pic, publicKey } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Please Enter all the Feilds' });
    return;
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
    publicKey,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      publicKey: user.publicKey,
      token: generateToken(user._id as any),
    });
  } else {
    res.status(400).json({ message: 'Failed to Create the User' });
  }
};

export const authUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      publicKey: user.publicKey,
      token: generateToken(user._id as any),
    });
  } else {
    res.status(401).json({ message: 'Invalid Email or Password' });
  }
};

export const updatePublicKey = async (req: any, res: Response): Promise<void> => {
  const { publicKey } = req.body;
  if (!publicKey) {
    res.status(400).json({ message: 'Public Key is required' });
    return;
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.publicKey = publicKey;
    await user.save();
    res.json({ message: 'Public key updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const allUsers = async (req: any, res: Response): Promise<void> => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
};

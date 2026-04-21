import express from 'express';
import { registerUser, authUser, allUsers, updatePublicKey } from '../Controllers/authController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers);
router.post('/login', authUser);
router.put('/update-key', protect, updatePublicKey);

export default router;

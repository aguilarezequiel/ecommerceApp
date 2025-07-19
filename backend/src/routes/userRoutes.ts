import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getUserProfile, updateUserProfile } from '../controllers/userController';

const router = Router();

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

export default router;
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getUserProfile, updateUserProfile } from '../controllers/userController';

const router = Router();

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

export default router;

// backend/src/controllers/userController.ts - ACTUALIZADO
import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional()
});

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const updateData = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ error: 'Invalid data' });
  }
};
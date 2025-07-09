// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { register, login, verifyToken, refreshToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Rutas protegidas
router.get('/verify', authenticateToken, verifyToken);

export default router;
// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { 
  register, 
  login, 
  verifyToken, 
  refreshToken, 
  logout, 
  changePassword,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// ===============================
// RUTAS PÚBLICAS (sin autenticación)
// ===============================

// Registro y login
router.post('/register', register);
router.post('/login', login);

// Refresh token
router.post('/refresh', refreshToken);

// Reset de contraseña
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// ===============================
// RUTAS PROTEGIDAS (requieren autenticación)
// ===============================

// Verificar token
router.get('/verify', authenticateToken, verifyToken);

// Logout
router.post('/logout', authenticateToken, logout);

// Cambiar contraseña
router.post('/change-password', authenticateToken, changePassword);

export default router;
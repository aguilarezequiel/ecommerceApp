import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  token: z.string().min(1)
});

// Función helper para generar tokens
const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' } // Token de acceso corto
  );

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    { expiresIn: '7d' } // Token de refresh más largo
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber
      },
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

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      user,
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Invalid data provided' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid data provided' });
  }
};

export const verifyToken = async (req: AuthRequest, res: Response) => {
  try {
    // Si llegamos aquí, el token ya fue verificado por el middleware
    // Solo necesitamos devolver la información del usuario
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
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

    res.json({
      valid: true,
      user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = refreshTokenSchema.parse(req.body);

    // Verificar el refresh token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!
    ) as any;

    // Buscar el usuario para asegurarse de que aún existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      return res.status(401).json({ error: 'User not found' });
    }

    // Generar nuevos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({
      user,
      token: accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // En una implementación más avanzada, aquí podrías invalidar el token
    // agregándolo a una blacklist en Redis o en la base de datos
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6)
    }).parse(req.body);

    // Buscar el usuario actual
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, password: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verificar la contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id: req.userId! },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ error: 'Failed to change password' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = z.object({
      email: z.string().email()
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Por seguridad, siempre devolvemos success aunque el usuario no exista
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent' 
      });
    }

    // Generar token de reset
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password-reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // En una implementación real, aquí enviarías un email con el token
    // Por ahora, solo lo devolvemos (NO HAGAS ESTO EN PRODUCCIÓN)
    console.log('Password reset token for', email, ':', resetToken);

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent',
      // Remover esta línea en producción:
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(400).json({ error: 'Failed to process password reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = z.object({
      token: z.string().min(1),
      newPassword: z.string().min(6)
    }).parse(req.body);

    // Verificar el token de reset
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    console.error('Password reset error:', error);
    res.status(400).json({ error: 'Failed to reset password' });
  }
};
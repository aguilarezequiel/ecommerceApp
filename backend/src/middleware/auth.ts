// backend/src/middleware/auth.ts - VERSIÓN COMPLETA ACTUALIZADA
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

// Interfaz para el usuario autenticado
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  user?: AuthUser; // Agregamos la propiedad user
}

// Función principal de autenticación
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Buscar el usuario en la base de datos para obtener datos completos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Establecer tanto las propiedades individuales como el objeto user
    req.userId = user.id;
    req.userRole = user.role;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Versión liviana para casos que solo necesitan userId (mejor rendimiento)
export const authenticateTokenLight = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Aliases para compatibilidad
export const auth = authenticateToken;
export const authLight = authenticateTokenLight;
export const adminAuth = requireAdmin;
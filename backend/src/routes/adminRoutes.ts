// backend/src/routes/adminRoutes.ts
import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  // Productos
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  
  // Pedidos
  getAdminOrders,
  updateOrderStatus,
  
  // Dashboard
  getDashboardStats,
  
  // Usuarios
  getUsers,
  updateUserRole,
  deleteUser
} from '../controllers/adminController';

const router = Router();

// Middleware: todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Gestión de productos
router.get('/products', getAdminProducts);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

// Gestión de pedidos
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Gestión de usuarios
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
} from '../controllers/adminController';

const router = Router();

// Apply authentication and admin check to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products Management
router.get('/products', getAllProductsAdmin);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders Management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
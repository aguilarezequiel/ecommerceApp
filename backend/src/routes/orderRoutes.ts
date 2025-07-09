// backend/src/routes/orderRoutes.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createOrder,
  getOrders,
  getOrder,
  trackOrder,
  trackOrderPublic,
  cancelOrder
} from '../controllers/orderController';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/track/:trackingCode', trackOrderPublic);

// Rutas protegidas
router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/my/:trackingCode', trackOrder);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

export default router;
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createOrder,
  getOrders,
  getOrder,
  trackOrder,
  trackOrderPublic
} from '../controllers/orderController';

const router = Router();

// Public routes (no authentication required)
router.get('/track/:trackingCode', trackOrderPublic);

// Protected routes
router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/my/:trackingCode', trackOrder);
router.get('/:id', getOrder);

export default router;
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} from '../controllers/cartController';

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);

export default router;
// backend/src/routes/productRoutes.ts
import { Router } from 'express';
import { 
  getProducts, 
  getProduct, 
  getFeaturedProducts,
  searchProducts,
  getProductsByCategory 
} from '../controllers/productController';

const router = Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);

export default router;
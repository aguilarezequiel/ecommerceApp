// backend/src/routes/categories.ts - CREAR ESTE ARCHIVO
import { Router } from 'express';
import { auth, adminAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategoriesAdmin
} from '../controllers/categoryController';

const router = Router();

// Rutas públicas
router.get('/', getCategories);
router.get('/:id', getCategory);

// Rutas de administrador
router.post('/', auth, adminAuth, upload.single('icon'), createCategory);
router.put('/:id', auth, adminAuth, upload.single('icon'), updateCategory);
router.delete('/:id', auth, adminAuth, deleteCategory);
router.get('/admin/all', auth, adminAuth, getAllCategoriesAdmin);

export default router;
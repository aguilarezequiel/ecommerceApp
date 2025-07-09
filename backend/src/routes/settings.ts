import { Router } from 'express';
import { auth, adminAuth } from '../middleware/auth';
import { getAppSettings, updateAppSettings } from '../controllers/settingsController';

const router = Router();

// Ruta pública para obtener configuración (solo número de WhatsApp)
router.get('/', getAppSettings);

// Ruta de administrador para actualizar configuración
router.put('/', auth, adminAuth, updateAppSettings);

export default router;
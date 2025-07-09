import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';

const updateSettingsSchema = z.object({
  adminPhoneNumber: z.string().min(1),
  whatsappMessage: z.string().optional()
});

export const getAppSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.appSettings.findFirst();
    
    if (!settings) {
      // Crear configuración por defecto si no existe
      const defaultSettings = await prisma.appSettings.create({
        data: {
          adminPhoneNumber: '+5491123456789',
          whatsappMessage: 'Hola, me gustaría hacer una consulta sobre ShopApp'
        }
      });
      return res.json(defaultSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateAppSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { adminPhoneNumber, whatsappMessage } = updateSettingsSchema.parse(req.body);

    let settings = await prisma.appSettings.findFirst();

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          adminPhoneNumber,
          whatsappMessage
        }
      });
    } else {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: {
          adminPhoneNumber,
          whatsappMessage
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(400).json({ error: 'Invalid data' });
  }
};
// backend/src/controllers/categoryController.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  iconName: z.string().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

// Obtener todas las categorías activas (público)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          select: { id: true }
        }
      }
    });

    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category.products.length,
      products: undefined // No enviamos los productos, solo el conteo
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Obtener categoría por ID
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true
          }
        }
      }
    });

    if (!category || !category.isActive) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// ADMIN: Crear categoría
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, iconName } = createCategorySchema.parse(req.body);

    // Verificar si ya existe una categoría con ese nombre
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    let iconUrl = null;
    if (req.file) {
      iconUrl = `/uploads/${req.file.filename}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        iconName,
        iconUrl
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ error: 'Invalid data' });
  }
};

// ADMIN: Actualizar categoría
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateCategorySchema.parse(req.body);

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo
    if (updateData.name && updateData.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: updateData.name }
      });

      if (nameExists) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }

    let iconUrl = existingCategory.iconUrl;
    if (req.file) {
      iconUrl = `/uploads/${req.file.filename}`;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...updateData,
        iconUrl
      }
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ error: 'Invalid data' });
  }
};

// ADMIN: Eliminar categoría (soft delete)
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar si la categoría tiene productos asociados
    const productsCount = await prisma.product.count({
      where: { categoryId: id, isActive: true }
    });

    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with active products. Please move or delete the products first.' 
      });
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// ADMIN: Obtener todas las categorías (incluyendo inactivas)
export const getAllCategoriesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          products: {
            where: { isActive: true },
            select: { id: true }
          }
        }
      }),
      prisma.category.count({ where })
    ]);

    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category.products.length,
      products: undefined
    }));

    res.json({
      categories: categoriesWithCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
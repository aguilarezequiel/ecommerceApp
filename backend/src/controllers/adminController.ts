import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string().min(1)
});

const updateProductSchema = createProductSchema.partial();

// Products Management
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, category } = createProductSchema.parse({
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock)
    });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        category,
        imageUrl
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateProductSchema.parse({
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      stock: req.body.stock ? parseInt(req.body.stock) : undefined
    });

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (existingProduct.imageUrl) {
        const oldImagePath = path.join(process.cwd(), 'uploads', path.basename(existingProduct.imageUrl));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete image file if exists
    if (product.imageUrl) {
      const imagePath = path.join(process.cwd(), 'uploads', path.basename(product.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const getAllProductsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search, category } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Orders Management
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          orderItems: {
            include: {
              product: {
                select: { name: true, imageUrl: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    }).parse(req.body);

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        orderItems: {
          include: { product: true }
        }
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ error: 'Invalid data' });
  }
};

// Dashboard Stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } })
    ]);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Sales by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesByMonth = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { not: 'CANCELLED' }
      }
    });

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      salesByMonth
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
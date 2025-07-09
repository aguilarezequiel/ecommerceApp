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

const updateUserRoleSchema = z.object({
  role: z.enum(['CUSTOMER', 'ADMIN'])
});

// Tipo para los datos de actualización que incluye imageUrl
type UpdateProductData = z.infer<typeof updateProductSchema> & {
  imageUrl?: string;
};

// ===============================
// PRODUCTS MANAGEMENT
// ===============================

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
    
    // Parseamos los datos con el schema parcial
    const parsedData = updateProductSchema.parse({
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      stock: req.body.stock ? parseInt(req.body.stock) : undefined
    });

    // Creamos el objeto de actualización con el tipo correcto
    const updateData: UpdateProductData = { ...parsedData };

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

// Alias para getAdminProducts (nombre que se usa en las rutas)
export const getAdminProducts = async (req: AuthRequest, res: Response) => {
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

// Mantener getAllProductsAdmin para compatibilidad
export const getAllProductsAdmin = getAdminProducts;

// ===============================
// ORDERS MANAGEMENT
// ===============================

// Alias para getAdminOrders (nombre que se usa en las rutas)
export const getAdminOrders = async (req: AuthRequest, res: Response) => {
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

// Mantener getAllOrders para compatibilidad
export const getAllOrders = getAdminOrders;

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

// ===============================
// USERS MANAGEMENT
// ===============================

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search, role } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
          // No incluir password por seguridad
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = updateUserRoleSchema.parse(req.body);

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Evitar que un admin se quite a sí mismo el rol de admin
    if (req.userId === id && role === 'CUSTOMER') {
      return res.status(400).json({ 
        error: 'You cannot remove admin role from yourself' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Evitar que un admin se elimine a sí mismo
    if (req.userId === id) {
      return res.status(400).json({ 
        error: 'You cannot delete yourself' 
      });
    }

    // Verificar que no hay órdenes activas para este usuario
    const activeOrders = await prisma.order.count({
      where: { 
        userId: id,
        status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] }
      }
    });

    if (activeOrders > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with active orders. Please cancel or complete orders first.' 
      });
    }

    // Eliminar usuario (esto también eliminará sus relaciones en cascada)
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ===============================
// DASHBOARD STATS
// ===============================

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      totalUsers
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } })
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

    // Top products by sales
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: true,
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 5
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, imageUrl: true }
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
          orderCount: item._count
        };
      })
    );

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      lowStockProducts,
      totalUsers,
      recentOrders,
      salesByMonth,
      topProducts: topProductsWithDetails
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
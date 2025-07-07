import { Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';
import { sendOrderConfirmation } from '../services/emailService';

const createOrderSchema = z.object({
  shippingAddr: z.string().min(10, 'Dirección de envío debe tener al menos 10 caracteres')
});

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { shippingAddr } = createOrderSchema.parse(req.body);
    const userId = req.user!.id;

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock availability
    for (const item of cartItems) {
      if (!item.product.isActive) {
        return res.status(400).json({ 
          error: `Product ${item.product.name} is no longer available` 
        });
      }
      
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Not enough stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // Generate tracking code
    const trackingCode = uuidv4().split('-')[0].toUpperCase();

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          shippingAddr,
          trackingCode,
          customerEmail: req.user!.email,
          status: 'PENDING'
        }
      });

      // Create order items and update stock
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    // Get complete order data for email
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    // Send confirmation email
    try {
      await sendOrderConfirmation(req.user!.email, {
        id: order.id,
        total: Number(order.total),
        trackingCode: order.trackingCode!,
        items: orderWithItems!.orderItems.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: Number(item.price)
        }))
      });
      console.log(`Confirmation email sent to ${req.user!.email}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order creation if email fails
      // In production, you might want to queue this for retry
    }

    res.status(201).json({ 
      order,
      message: 'Order created successfully',
      trackingCode: order.trackingCode
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ error: 'Failed to create order' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user!.id },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where: { userId: req.user!.id } })
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

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId: req.user!.id 
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const trackOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { trackingCode } = req.params;

    const order = await prisma.order.findFirst({
      where: { trackingCode },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
};

// Public tracking (no authentication required)
export const trackOrderPublic = async (req: any, res: Response) => {
  try {
    const { trackingCode } = req.params;

    const order = await prisma.order.findFirst({
      where: { trackingCode },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return limited information for public tracking
    res.json({
      id: order.id,
      status: order.status,
      trackingCode: order.trackingCode,
      total: order.total,
      createdAt: order.createdAt,
      orderItems: order.orderItems.map(item => ({
        quantity: item.quantity,
        price: item.price,
        product: {
          name: item.product.name,
          imageUrl: item.product.imageUrl
        }
      }))
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
};
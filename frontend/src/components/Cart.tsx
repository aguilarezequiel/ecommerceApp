'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { cartAPI } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { getImageUrl, formatPrice } from '@/lib/imageUtils';

export default function Cart() {
  const [loading, setLoading] = useState(true);
  const { items, total, setCart, updateItem, removeItem } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data.cartItems, response.data.total);
    } catch (error) {
      toast.error('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await cartAPI.updateCartItem(itemId, newQuantity);
      updateItem(itemId, newQuantity);
      toast.success('Cantidad actualizada');
    } catch (error) {
      toast.error('Error al actualizar cantidad');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await cartAPI.removeFromCart(itemId);
      removeItem(itemId);
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  // Helper function to calculate item total
  const getItemTotal = (item: any): number => {
    const price = typeof item.product.price === 'string' 
      ? parseFloat(item.product.price) 
      : item.product.price;
    return (price || 0) * item.quantity;
  };

  // Calculate total safely
  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Inicia sesión para ver tu carrito
        </h2>
        <p className="text-gray-600 mb-6">
          Necesitas una cuenta para guardar productos en tu carrito
        </p>
        <Link
          href="/login"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex space-x-4">
              <div className="h-20 w-20 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-600 mb-6">
          Agrega algunos productos para comenzar a comprar
        </p>
        <Link
          href="/products"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Explorar Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Carrito de Compras
        </h1>
        
        {items.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="relative h-20 w-20 rounded overflow-hidden">
                {item.product.imageUrl ? (
                  <Image
                    src={getImageUrl(item.product.imageUrl)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Sin imagen</span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Precio: ${formatPrice(item.product.price)}
                </p>
                <p className="text-gray-600 text-sm">
                  Stock disponible: {item.product.stock}
                </p>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                
                <span className="text-lg font-medium w-8 text-center">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {/* Item Total */}
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  ${getItemTotal(item).toFixed(2)}
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-800 mt-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resumen del Pedido
          </h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors text-center block"
          >
            Proceder al Checkout
          </Link>
          
          <Link
            href="/products"
            className="w-full text-primary-600 py-2 px-4 text-center block mt-3 hover:text-primary-700"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
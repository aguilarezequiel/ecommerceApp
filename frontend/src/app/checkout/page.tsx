'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/lib/store';
import { ordersAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const [shippingAddr, setShippingAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Debes iniciar sesión para continuar');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      router.push('/cart');
      return;
    }

    if (shippingAddr.length < 10) {
      toast.error('La dirección de envío debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await ordersAPI.createOrder(shippingAddr);
      clearCart();
      toast.success('¡Pedido creado exitosamente!');
      router.push(`/order-confirmation?tracking=${response.data.trackingCode}`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al crear el pedido';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Inicia sesión para continuar
        </h1>
        <button
          onClick={() => router.push('/login')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Tu carrito está vacío
        </h1>
        <button
          onClick={() => router.push('/products')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Explorar Productos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Resumen del Pedido</h2>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.quantity}x {item.product.name}</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Información de Envío</h2>
        
        <div className="mb-4">
          <label htmlFor="shippingAddr" className="block text-sm font-medium text-gray-700 mb-2">
            Dirección de Envío *
          </label>
          <textarea
            id="shippingAddr"
            required
            value={shippingAddr}
            onChange={(e) => setShippingAddr(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ingresa tu dirección completa de envío..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Incluye calle, número, ciudad, código postal y cualquier referencia adicional
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Información de Contacto</h3>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Nombre:</strong> {user.firstName} {user.lastName}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando Pedido...
            </div>
          ) : (
            `Confirmar Pedido - $${total.toFixed(2)}`
          )}
        </button>
      </form>
    </div>
  );
}
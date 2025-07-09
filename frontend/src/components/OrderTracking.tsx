// frontend/src/components/OrderTracking.tsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '@/lib/imageUtils';

interface TrackingInfo {
  id: string;
  status: string;
  trackingCode: string;
  total: number;
  createdAt: string;
  orderItems: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl?: string;
    };
  }>;
}

interface OrderTrackingProps {
  initialCode?: string;
}

const statusSteps = [
  { key: 'PENDING', label: 'Pendiente', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Procesando', icon: Package },
  { key: 'SHIPPED', label: 'Enviado', icon: Truck },
  { key: 'DELIVERED', label: 'Entregado', icon: CheckCircle },
];

export default function OrderTracking({ initialCode = '' }: OrderTrackingProps) {
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-search if initialCode is provided
  useEffect(() => {
    if (initialCode) {
      setTrackingCode(initialCode);
      trackOrderWithCode(initialCode);
    }
  }, [initialCode]);

  const trackOrderWithCode = async (code: string) => {
    setLoading(true);
    setNotFound(false);
    setTrackingInfo(null);

    try {
      const response = await ordersAPI.trackOrder(code.trim());
      setTrackingInfo(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error('Error al consultar el seguimiento');
      }
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      toast.error('Ingresa un código de seguimiento');
      return;
    }

    await trackOrderWithCode(trackingCode);
  };

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const formatPrice = (price: any): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Seguimiento de Pedido
        </h1>
        <p className="text-gray-600">
          Ingresa tu código de seguimiento para ver el estado de tu pedido
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <form onSubmit={trackOrder} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ingresa tu código de seguimiento (ej: 1CDA01F2)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Search className="h-5 w-5" />
            )}
            Buscar
          </button>
        </form>
      </div>

      {/* Not Found Message */}
      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <Package className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Pedido no encontrado</h3>
            <p className="text-sm">
              No se encontró ningún pedido con el código de seguimiento <strong>{trackingCode}</strong>.
              Verifica que el código sea correcto.
            </p>
          </div>
        </div>
      )}

      {/* Tracking Info */}
      {trackingInfo && (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Pedido #{trackingInfo.id.slice(-8)}
                </h2>
                <p className="text-gray-600">
                  Código de seguimiento: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{trackingInfo.trackingCode}</span>
                </p>
                <p className="text-gray-600">
                  Fecha: {new Date(trackingInfo.createdAt).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${formatPrice(trackingInfo.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Estado del Pedido
            </h3>
            
            <div className="relative">
              {statusSteps.map((step, index) => {
                const currentStepIndex = getCurrentStepIndex(trackingInfo.status);
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex items-center mb-8 last:mb-0">
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                        isCompleted
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h4 className={`font-medium ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                            Actual
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Connector line */}
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute left-6 mt-12 w-0.5 h-8 ${
                          isCompleted ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                        style={{ top: `${index * 80 + 48}px` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Productos del Pedido
            </h3>
            
            <div className="space-y-4">
              {trackingInfo.orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product Image */}
                  <div className="relative h-16 w-16 rounded overflow-hidden">
                    {item.product.imageUrl ? (
                      <Image
                        src={getImageUrl(item.product.imageUrl)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity} × ${formatPrice(item.price)}
                    </p>
                  </div>
                  
                  {/* Total */}
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${formatPrice(item.quantity * parseFloat(item.price.toString()))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';
import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

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

const statusSteps = [
  { key: 'PENDING', label: 'Pendiente', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Procesando', icon: Package },
  { key: 'SHIPPED', label: 'Enviado', icon: Truck },
  { key: 'DELIVERED', label: 'Entregado', icon: CheckCircle },
];

export default function OrderTracking() {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      toast.error('Ingresa un código de seguimiento');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setTrackingInfo(null);

    try {
      const response = await ordersAPI.trackOrder(trackingCode.trim());
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

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
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
              placeholder="Ingresa tu código de seguimiento"
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
              No se encontró ningún pedido con el código de seguimiento proporcionado.
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
                  Pedido #{trackingInfo.id}
                </h2>
                <p className="text-gray-600">
                  Código de seguimiento: {trackingInfo.trackingCode}
                </p>
                <p className="text-gray-600">
                  Fecha: {new Date(trackingInfo.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${trackingInfo.total.toFixed(2)}
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

                    {/* Line */}
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute left-6 w-0.5 h-16 -mt-8 ${
                          index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                        style={{ top: '3rem' }}
                      />
                    )}

                    {/* Content */}
                    <div className="ml-4">
                      <h4
                        className={`text-sm font-semibold ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <p className="text-sm text-primary-600 font-medium">
                          Estado actual
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Productos del Pedido
            </h3>
            
            <div className="space-y-4">
              {trackingInfo.orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                  <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
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
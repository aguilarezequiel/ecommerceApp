'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, ExternalLink } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '@/lib/imageUtils';

interface Order {
  id: string;
  total: number;
  status: string;
  trackingCode: string;
  shippingAddr: string;
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

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
  PROCESSING: { label: 'Procesando', color: 'text-purple-600 bg-purple-100', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-100', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'text-green-800 bg-green-200', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-100', icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      toast.error('Debes iniciar sesión para ver tus pedidos');
      return;
    }
    
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Error al cargar pedidos');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
        <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tus pedidos</p>
        <Link href="/login" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-600">Gestiona y rastrea tus pedidos</p>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos aún</h3>
          <p className="text-gray-600 mb-6">Cuando realices tu primer pedido, aparecerá aquí</p>
          <Link href="/" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.id.slice(-8)}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Código de seguimiento: {order.trackingCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      Realizado el {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      ${Number(order.total).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.orderItems.length} producto{order.orderItems.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="border-t pt-4 mb-4">
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {order.orderItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex-shrink-0 flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product.imageUrl ? (
                            <Image
                              src={getImageUrl(item.product.imageUrl)}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg text-xs text-gray-600">
                        +{order.orderItems.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <strong>Dirección:</strong> {order.shippingAddr}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/track?code=${order.trackingCode}`}
                      className="inline-flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Rastrear
                    </Link>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Detalle del Pedido #{selectedOrder.id.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Info */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Información del Pedido</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <p className="font-medium">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <p className="font-medium">{getStatusInfo(selectedOrder.status).label}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Código de Seguimiento:</span>
                      <p className="font-medium">{selectedOrder.trackingCode}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha:</span>
                      <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Dirección de Envío:</span>
                      <p className="font-medium">{selectedOrder.shippingAddr}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Productos Ordenados</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${(item.quantity * Number(item.price)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <Link
                  href={`/track?code=${selectedOrder.trackingCode}`}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Rastrear Pedido
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
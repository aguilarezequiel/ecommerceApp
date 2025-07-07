'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Filter, Eye, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  total: number;
  status: string;
  trackingCode: string;
  shippingAddr: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  orderItems: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl?: string;
    };
  }>;
}

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  { value: 'CONFIRMED', label: 'Confirmado', color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
  { value: 'PROCESSING', label: 'Procesando', color: 'text-purple-600 bg-purple-100', icon: Package },
  { value: 'SHIPPED', label: 'Enviado', color: 'text-green-600 bg-green-100', icon: Truck },
  { value: 'DELIVERED', label: 'Entregado', color: 'text-green-800 bg-green-200', icon: CheckCircle },
  { value: 'CANCELLED', label: 'Cancelado', color: 'text-red-600 bg-red-100', icon: XCircle },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Acceso denegado');
      return;
    }
    
    fetchOrders();
  }, [user, currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrders({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined
      });
      
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success('Estado del pedido actualizado');
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Error al actualizar estado del pedido');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
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

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600">Administra y actualiza el estado de los pedidos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando pedidos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.trackingCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user.firstName} {order.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron pedidos
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Detalle del Pedido #{selectedOrder.id.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Información del Pedido</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {selectedOrder.id}</div>
                      <div><strong>Código de Seguimiento:</strong> {selectedOrder.trackingCode}</div>
                      <div><strong>Fecha:</strong> {formatDate(selectedOrder.createdAt)}</div>
                      <div><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Información del Cliente</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nombre:</strong> {selectedOrder.user.firstName} {selectedOrder.user.lastName}</div>
                      <div><strong>Email:</strong> {selectedOrder.user.email}</div>
                      <div><strong>Dirección de Envío:</strong> {selectedOrder.shippingAddr}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Estado del Pedido</h3>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {statusOptions.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {updatingStatus && (
                      <p className="text-sm text-gray-500 mt-1">Actualizando estado...</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-4">Productos del Pedido</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-shrink-0">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.quantity * Number(item.price)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
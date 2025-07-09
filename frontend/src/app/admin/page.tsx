'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  Eye, 
  Edit,
  Plus,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    category: string;
  }>;
}

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-100' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-600 bg-blue-100' },
  PROCESSING: { label: 'Procesando', color: 'text-purple-600 bg-purple-100' },
  SHIPPED: { label: 'Enviado', color: 'text-green-600 bg-green-100' },
  DELIVERED: { label: 'Entregado', color: 'text-green-800 bg-green-200' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-100' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Acceso denegado');
      return;
    }
    
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  };

  // Redirect if not admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página</p>
        <Link href="/" className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Administración</h1>
        </div>
        
        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Administración</h1>
          <p className="text-gray-600">Bienvenido, {user?.firstName}. Aquí tienes un resumen de tu tienda</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="bg-primary-600 text-white p-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold">Gestionar Productos</h3>
            <p className="text-sm opacity-90">Agregar, editar y eliminar productos</p>
          </div>
          <Package className="h-8 w-8" />
        </Link>
        
        <Link
          href="/admin/orders"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold">Gestionar Pedidos</h3>
            <p className="text-sm opacity-90">Ver y actualizar estados de pedidos</p>
          </div>
          <ShoppingCart className="h-8 w-8" />
        </Link>

        <button
          onClick={fetchDashboardStats}
          className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-between"
        >
          <div>
            <h3 className="font-semibold">Actualizar Datos</h3>
            <p className="text-sm opacity-90">Refrescar estadísticas</p>
          </div>
          <TrendingUp className="h-8 w-8" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">${Number(stats?.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
              <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 flex items-center text-sm">
                Ver todos <Eye className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.slice(0, 5).map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.user.firstName} {order.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          #{order.id.slice(-8)} - {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${Number(order.total).toFixed(2)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No hay pedidos recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Productos con Stock Bajo</h2>
              <Link href="/admin/products" className="text-primary-600 hover:text-primary-700 flex items-center text-sm">
                Ver todos <Edit className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-semibold">{product.stock} en stock</span>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Todos los productos tienen stock suficiente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Create Button */}
      <div className="fixed bottom-6 right-6">
        <Link
          href="/admin/products"
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors hover:shadow-xl"
          title="Crear nuevo producto"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
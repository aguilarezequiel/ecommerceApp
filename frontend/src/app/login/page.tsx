import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}

// frontend/src/app/products/page.tsx
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductList from '@/components/ProductList';

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Productos
        </h1>
        {category && (
          <p className="text-gray-600">
            Categoría: {category}
          </p>
        )}
        {search && (
          <p className="text-gray-600">
            Búsqueda: "{search}"
          </p>
        )}
      </div>
      
      <ProductList category={category} search={search} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

// frontend/src/app/cart/page.tsx
import Cart from '@/components/Cart';

export default function CartPage() {
  return <Cart />;
}

// frontend/src/app/track/page.tsx
import OrderTracking from '@/components/OrderTracking';

export default function TrackPage() {
  return <OrderTracking />;
}

// frontend/src/app/orders/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  total: number;
  status: string;
  trackingCode: string;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getOrders();
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Inicia sesión para ver tus pedidos
        </h1>
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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No tienes pedidos aún</p>
          <Link
            href="/products"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Comenzar a Comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">Pedido #{order.id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Seguimiento: {order.trackingCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Productos:</h4>
                <ul className="space-y-1">
                  {order.orderItems.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {item.quantity}x {item.product.name} - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Link
                  href={`/track?code=${order.trackingCode}`}
                  className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition-colors"
                >
                  Rastrear Pedido
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// frontend/src/app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Administración</h1>
        <p className="text-gray-600">Resumen de tu tienda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-gray-900">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.lowStockProducts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors"
          >
            <Package className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-medium">Gestionar Productos</h3>
            <p className="text-sm text-gray-600">Agregar, editar o eliminar productos</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors"
          >
            <ShoppingCart className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium">Ver Pedidos</h3>
            <p className="text-sm text-gray-600">Gestionar pedidos y estados</p>
          </Link>

          <Link
            href="/admin/products?filter=low-stock"
            className="bg-red-50 hover:bg-red-100 p-4 rounded-lg transition-colors"
          >
            <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
            <h3 className="font-medium">Stock Bajo</h3>
            <p className="text-sm text-gray-600">Revisar productos con poco stock</p>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recientes</h2>
          <div className="space-y-3">
            {stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">#{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
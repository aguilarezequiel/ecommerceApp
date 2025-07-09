// frontend/src/app/page.tsx - VERSIÓN ACTUALIZADA
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import ProductList from '@/components/ProductList';
import CategoryIcon from '@/components/CategoryIcon';
import { useAuthStore } from '@/lib/authStore';

interface Category {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  iconUrl?: string;
  productCount: number;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a ShopApp
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Tu tienda en línea de confianza con los mejores productos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Explorar Productos
            </Link>
            
            {user && (
              <Link
                href="/orders"
                className="bg-primary-800 border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors inline-block"
              >
                Mis Pedidos
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir ShopApp?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gran Variedad</h3>
              <p className="text-gray-600">Miles de productos en diferentes categorías</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
              <p className="text-gray-600">Entrega en 24-48 horas</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compra Segura</h3>
              <p className="text-gray-600">Pagos 100% seguros y protegidos</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Soporte 24/7</h3>
              <p className="text-gray-600">Estamos aquí para ayudarte siempre</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Categorías Populares
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {category.iconUrl ? (
                        <img 
                          src={category.iconUrl} 
                          alt={category.name}
                          className="h-16 w-16 object-cover rounded-full"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                          <CategoryIcon 
                            iconName={category.iconName} 
                            className="h-8 w-8 text-white" 
                          />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {category.description}
                    </p>
                    <p className="text-primary-600 text-sm font-medium">
                      {category.productCount} productos
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {categories.length > 8 && (
            <div className="text-center mt-8">
              <Link
                href="/categories"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ver Todas las Categorías
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Productos Destacados
          </h2>
          <ProductList limit={8} />
        </div>
      </section>
    </div>
  );
}
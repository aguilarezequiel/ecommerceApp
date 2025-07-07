'use client';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Truck, Shield, Clock } from 'lucide-react';
import ProductList from '@/components/ProductList';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-16 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Descubre productos increíbles
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            La mejor selección de productos con envío gratis y garantía de calidad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Explorar Productos
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/track"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Rastrear Pedido
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir nuestra tienda?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ofrecemos la mejor experiencia de compra con beneficios únicos para nuestros clientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Envío Gratis</h3>
            <p className="text-gray-600">
              Envío gratuito en todas las compras superiores a $50. Recibe tus productos en 3-5 días hábiles.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Garantía de Calidad</h3>
            <p className="text-gray-600">
              Todos nuestros productos cuentan con garantía de 30 días. Tu satisfacción es nuestra prioridad.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Soporte 24/7</h3>
            <p className="text-gray-600">
              Nuestro equipo de soporte está disponible las 24 horas para ayudarte con cualquier consulta.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explora por categorías
          </h2>
          <p className="text-gray-600">
            Encuentra exactamente lo que estás buscando
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Electrónicos', value: 'electronics', emoji: '📱' },
            { name: 'Ropa', value: 'clothing', emoji: '👕' },
            { name: 'Hogar', value: 'home', emoji: '🏠' },
            { name: 'Deportes', value: 'sports', emoji: '⚽' },
            { name: 'Libros', value: 'books', emoji: '📚' },
            { name: 'Juguetes', value: 'toys', emoji: '🧸' },
          ].map((category) => (
            <Link
              key={category.value}
              href={`/products?category=${category.value}`}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {category.emoji}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Productos Destacados
            </h2>
            <p className="text-gray-600">Los más vendidos de la semana</p>
          </div>
          <Link
            href="/products"
            className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-2"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductList />
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Mantente al día con nuestras ofertas
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Suscríbete a nuestro newsletter y sé el primero en conocer nuestras ofertas exclusivas, 
          nuevos productos y promociones especiales.
        </p>
        
        <div className="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            placeholder="tu@email.com"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
            Suscribirse
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          No spam, solo las mejores ofertas. Puedes darte de baja en cualquier momento.
        </p>
      </section>
    </div>
  );
}
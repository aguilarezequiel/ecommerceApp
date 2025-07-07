'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                ShopApp
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <span className="text-gray-700">Hola, {user.firstName}</span>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Mis Pedidos
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
              
              {/* Cart */}
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-primary-600 transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-2 pl-10 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              {/* Mobile Menu Items */}
              <div className="space-y-2">
                {user ? (
                  <>
                    <div className="text-gray-700 font-medium">Hola, {user.firstName}</div>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="block text-gray-700 hover:text-primary-600">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/orders" className="block text-gray-700 hover:text-primary-600">
                      Mis Pedidos
                    </Link>
                    <Link href="/cart" className="block text-gray-700 hover:text-primary-600">
                      Carrito ({cartItemsCount})
                    </Link>
                    <button onClick={logout} className="block text-gray-700 hover:text-primary-600 w-full text-left">
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block text-gray-700 hover:text-primary-600">
                      Iniciar Sesión
                    </Link>
                    <Link href="/register" className="block text-gray-700 hover:text-primary-600">
                      Registrarse
                    </Link>
                    <Link href="/cart" className="block text-gray-700 hover:text-primary-600">
                      Carrito ({cartItemsCount})
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ShopApp</h3>
              <p className="text-gray-300">Tu tienda en línea de confianza</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/about">Acerca de</Link></li>
                <li><Link href="/contact">Contacto</Link></li>
                <li><Link href="/privacy">Privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categorías</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/products?category=electronics">Electrónicos</Link></li>
                <li><Link href="/products?category=clothing">Ropa</Link></li>
                <li><Link href="/products?category=home">Hogar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/track">Rastrear Pedido</Link></li>
                <li><Link href="/help">Ayuda</Link></li>
                <li><Link href="/returns">Devoluciones</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 ShopApp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
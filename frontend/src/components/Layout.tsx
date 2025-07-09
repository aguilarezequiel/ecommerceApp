// frontend/src/components/Layout.tsx - VERSIÓN ACTUALIZADA
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, Home as HomeIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { useCartStore } from '@/lib/cartStore';
import WhatsAppWidget from './WhatsAppWidget';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ShopApp</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                <HomeIcon className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
                Productos
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-primary-600 transition-colors">
                Categorías
              </Link>
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 font-medium">Hola, {user.firstName}</span>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/orders" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Mis Pedidos
                  </Link>
                  <Link href="/cart" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                  <button onClick={logout} className="text-gray-700 hover:text-primary-600 transition-colors">
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Registrarse
                  </Link>
                  <Link href="/cart" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Inicio</span>
                </Link>
                <Link 
                  href="/products" 
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Productos
                </Link>
                <Link 
                  href="/categories" 
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categorías
                </Link>
                {user ? (
                  <>
                    <div className="text-gray-700 font-medium">Hola, {user.firstName}</div>
                    {user.role === 'ADMIN' && (
                      <Link 
                        href="/admin" 
                        className="block text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link 
                      href="/orders" 
                      className="block text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mis Pedidos
                    </Link>
                    <Link 
                      href="/cart" 
                      className="block text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Carrito ({cartItemsCount})
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }} 
                      className="block text-gray-700 hover:text-primary-600 w-full text-left"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="block text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      href="/register" 
                      className="block text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                    <Link 
                      href="/cart" 
                      className="block text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Carrito ({cartItemsCount})
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* WhatsApp Widget */}
      <WhatsAppWidget />

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
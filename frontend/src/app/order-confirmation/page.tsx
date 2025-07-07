'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('tracking');

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        ¡Pedido Confirmado!
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        Tu pedido ha sido procesado exitosamente. 
        Recibirás un correo de confirmación en breve.
      </p>

      {trackingCode && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Código de Seguimiento
          </h2>
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
            <code className="text-xl font-mono text-primary-600 font-bold">
              {trackingCode}
            </code>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Guarda este código para hacer seguimiento de tu pedido
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col items-center p-4">
          <Mail className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Confirmación por Email</h3>
          <p className="text-sm text-gray-600 text-center">
            Recibirás los detalles del pedido en tu correo
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4">
          <Package className="h-8 w-8 text-orange-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Preparación</h3>
          <p className="text-sm text-gray-600 text-center">
            Prepararemos tu pedido en 1-2 días hábiles
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4">
          <Truck className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Envío</h3>
          <p className="text-sm text-gray-600 text-center">
            Entrega estimada en 3-5 días hábiles
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Link
          href={`/track?code=${trackingCode}`}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium inline-block"
        >
          Hacer Seguimiento del Pedido
        </Link>
        
        <Link
          href="/products"
          className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium inline-block"
        >
          Seguir Comprando
        </Link>
        
        <Link
          href="/orders"
          className="w-full text-primary-600 py-3 px-6 rounded-lg border border-primary-600 hover:bg-primary-50 transition-colors font-medium inline-block"
        >
          Ver Mis Pedidos
        </Link>
      </div>
    </div>
  );
}
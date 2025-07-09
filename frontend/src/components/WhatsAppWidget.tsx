// frontend/src/components/WhatsAppWidget.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface AppSettings {
  adminPhoneNumber: string;
  whatsappMessage: string;
}

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setMessage(data.whatsappMessage || 'Hola, me gustaría hacer una consulta sobre ShopApp');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
      // Valores por defecto
      setSettings({
        adminPhoneNumber: '+5491123456789',
        whatsappMessage: 'Hola, me gustaría hacer una consulta sobre ShopApp'
      });
      setMessage('Hola, me gustaría hacer una consulta sobre ShopApp');
    }
  };

  const handleSendMessage = () => {
    if (settings) {
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${settings.adminPhoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      setIsOpen(false);
    }
  };

  if (!settings) return null;

  return (
    <>
      {/* Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-pulse"
            aria-label="Abrir chat de WhatsApp"
          >
            <MessageCircle size={24} />
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border overflow-hidden">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <MessageCircle className="text-green-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <p className="text-xs text-green-100">Soporte ShopApp</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-green-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                ¡Hola! 👋 Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu mensaje:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle size={16} />
                <span>Enviar</span>
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Te redirigiremos a WhatsApp para continuar la conversación
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWidget;
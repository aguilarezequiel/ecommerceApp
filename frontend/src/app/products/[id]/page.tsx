'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { productsAPI, cartAPI } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { getImageUrl, formatPrice } from '@/lib/imageUtils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(params.id as string);
      setProduct(response.data);
    } catch (error) {
      toast.error('Producto no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para agregar al carrito');
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    try {
      await cartAPI.addToCart(product.id, quantity);
      addItem({
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock
        }
      });
      toast.success('Producto agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Producto no encontrado</h1>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Image */}
      <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">(4.0) • 125 reseñas</span>
          </div>
        </div>

        <div className="text-3xl font-bold text-gray-900">
          ${product.price.toFixed(2)}
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700">{product.description}</p>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Categoría: </span>
            <span className="text-sm text-gray-600 capitalize">{product.category}</span>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Stock disponible: </span>
            <span className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
              {product.stock} unidades
            </span>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-medium w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={addToCart}
            disabled={product.stock === 0 || addingToCart}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {addingToCart ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
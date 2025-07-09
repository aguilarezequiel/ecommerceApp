'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductList from '@/components/ProductList';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {category 
            ? `Productos - ${category.charAt(0).toUpperCase() + category.slice(1)}` 
            : search 
            ? `Resultados para "${search}"` 
            : 'Todos los Productos'
          }
        </h1>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href="/products"
            className={`px-4 py-2 rounded-lg transition-colors ${
              !category 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </a>
          <a
            href="/products?category=electronics"
            className={`px-4 py-2 rounded-lg transition-colors ${
              category === 'electronics' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Electrónicos
          </a>
          <a
            href="/products?category=clothing"
            className={`px-4 py-2 rounded-lg transition-colors ${
              category === 'clothing' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ropa
          </a>
          <a
            href="/products?category=home"
            className={`px-4 py-2 rounded-lg transition-colors ${
              category === 'home' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hogar
          </a>
          <a
            href="/products?category=books"
            className={`px-4 py-2 rounded-lg transition-colors ${
              category === 'books' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Libros
          </a>
        </div>
      </div>

      <ProductList category={category} search={search} />
    </div>
  );
}
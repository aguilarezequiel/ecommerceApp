// frontend/src/lib/imageUtils.ts

/**
 * Construye la URL completa para las imágenes del backend
 * @param imageUrl - URL relativa de la imagen (ej: "/uploads/image.jpg")
 * @returns URL completa (ej: "http://localhost:3001/uploads/image.jpg")
 */
export const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return '';
  
  // Si ya es una URL completa, devolverla tal como está
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Construir URL completa del backend
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
  
  // Asegurar que imageUrl comience con /
  const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${baseURL}${cleanImageUrl}`;
};

/**
 * Formatea el precio de forma segura
 * @param price - Precio como string o number
 * @returns Precio formateado con 2 decimales
 */
export const formatPrice = (price: any): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};
// frontend/src/components/CategoryIcon.tsx
import React from 'react';
import {
  Smartphone,
  Shirt,
  Home,
  Dumbbell,
  Book,
  Gamepad2,
  Monitor,
  Headphones,
  Camera,
  Watch,
  Car,
  Baby,
  Heart,
  Utensils,
  Gift,
  Music,
  Palette,
  Briefcase,
  GraduationCap,
  TreePine,
  Flower,
  Package,
  ShoppingBag
} from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  className?: string;
  size?: number;
}

const iconMap = {
  // Electrónicos
  'Smartphone': Smartphone,
  'Monitor': Monitor,
  'Headphones': Headphones,
  'Camera': Camera,
  'Watch': Watch,
  
  // Ropa y Accesorios
  'Shirt': Shirt,
  
  // Hogar
  'Home': Home,
  
  // Deportes
  'Dumbbell': Dumbbell,
  
  // Libros y Educación
  'Book': Book,
  'GraduationCap': GraduationCap,
  
  // Juguetes y Entretenimiento
  'Gamepad2': Gamepad2,
  'Music': Music,
  
  // Automóviles
  'Car': Car,
  
  // Bebés y Niños
  'Baby': Baby,
  
  // Salud y Belleza
  'Heart': Heart,
  
  // Alimentación
  'Utensils': Utensils,
  
  // Regalos
  'Gift': Gift,
  
  // Arte y Manualidades
  'Palette': Palette,
  
  // Oficina y Negocios
  'Briefcase': Briefcase,
  
  // Jardín
  'TreePine': TreePine,
  'Flower': Flower,
  
  // Otros
  'Package': Package,
  'ShoppingBag': ShoppingBag,
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName, 
  className = "h-6 w-6", 
  size = 24 
}) => {
  const IconComponent = iconName && iconMap[iconName as keyof typeof iconMap] 
    ? iconMap[iconName as keyof typeof iconMap] 
    : Package; // Icono por defecto

  return <IconComponent className={className} size={size} />;
};

export default CategoryIcon;
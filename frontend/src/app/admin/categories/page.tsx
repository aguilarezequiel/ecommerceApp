// frontend/src/app/admin/categories/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';

interface Category {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  iconUrl?: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconName: ''
  });
  const [iconFile, setIconFile] = useState<File | null>(null);

  const iconOptions = [
    'Smartphone', 'Monitor', 'Headphones', 'Camera', 'Watch',
    'Shirt', 'Home', 'Dumbbell', 'Book', 'GraduationCap',
    'Gamepad2', 'Music', 'Car', 'Baby', 'Heart',
    'Utensils', 'Gift', 'Palette', 'Briefcase', 'TreePine',
    'Flower', 'Package', 'ShoppingBag'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('iconName', formData.iconName);
      
      if (iconFile) {
        formDataToSend.append('icon', iconFile);
      }

      const url = editingCategory 
        ? `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        await fetchCategories();
        setShowModal(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar la categoría');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      iconName: category.iconName || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', iconName: '' });
    setIconFile(null);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                {category.iconUrl ? (
                  <img 
                    src={category.iconUrl} 
                    alt={category.name}
                    className="h-16 w-16 object-cover rounded-full"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <CategoryIcon 
                      iconName={category.iconName} 
                      className="h-8 w-8 text-white" 
                    />
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-2">
                {category.description}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>{category.productCount} productos</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={category.productCount > 0}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icono
                </label>
                <select
                  value={formData.iconName}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar icono</option>
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
                {formData.iconName && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Vista previa:</span>
                    <CategoryIcon iconName={formData.iconName} className="h-6 w-6 text-blue-600" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen personalizada (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si subes una imagen, se usará en lugar del icono seleccionado
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
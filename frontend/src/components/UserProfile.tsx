// frontend/src/components/UserProfile.tsx
'use client';
import { useState, useEffect } from 'react';
import { User, Phone, Mail, Edit2, Save, X } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
}

export default function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        alert('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-20 w-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Error al cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 size={16} />
            <span>Editar</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <Save size={16} />
              <span>{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
              <span>Cancelar</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
          <User size={32} />
        </div>
        {!isEditing ? (
          <h3 className="text-xl font-semibold text-gray-900">
            {userData.firstName} {userData.lastName}
          </h3>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Nombre"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Apellido"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
          userData.role === 'ADMIN' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {userData.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{userData.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Phone className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Teléfono</p>
            {!isEditing ? (
              <p className="font-medium text-gray-900">
                {userData.phoneNumber || 'No especificado'}
              </p>
            ) : (
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Número de teléfono"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <User className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Miembro desde</p>
            <p className="font-medium text-gray-900">
              {new Date(userData.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
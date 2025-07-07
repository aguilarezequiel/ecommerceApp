import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

interface CartState {
  items: CartItem[];
  total: number;
  setCart: (items: CartItem[], total: number) => void;
  addItem: (item: CartItem) => void;
  updateItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  setCart: (items, total) => set({ items, total }),
  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find(i => i.productId === item.productId);
    
    if (existingItem) {
      set({
        items: items.map(i => 
          i.productId === item.productId 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      });
    } else {
      set({ items: [...items, item] });
    }
    
    // Recalcular total
    const newItems = get().items;
    const newTotal = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    set({ total: newTotal });
  },
  updateItem: (id, quantity) => {
    set({
      items: get().items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    });
    
    const newTotal = get().items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    set({ total: newTotal });
  },
  removeItem: (id) => {
    set({ items: get().items.filter(item => item.id !== id) });
    
    const newTotal = get().items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    set({ total: newTotal });
  },
  clearCart: () => set({ items: [], total: 0 }),
}));
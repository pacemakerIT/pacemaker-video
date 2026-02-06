'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { ItemType, VideoCategory } from '@prisma/client';
import { toast } from 'sonner';
import { useUserContext } from './user-context';

export type Cart = {
  itemId: string;
  itemType: ItemType;
  id: string;
  title: string;
  price: number | string;
  description: string;
  category: VideoCategory | null;
  startDate: Date;
  selected: boolean;
};

interface CartContextType {
  cart: Cart[];
  addToCart: (itemId: string, itemType: ItemType) => Promise<void>;
  removeFromCart: (itemId: string[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserContext();
  const userId = user?.id;
  const [cart, setCart] = useState<Cart[]>([]);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`/api/cart?userId=${userId}`);
      const data = await res.json();
      setCart(data);
    } catch (err) {
      toast.error(`Failed to fetch cart: ${err}`);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setCart([]);
      return;
    }

    fetchCart();
  }, [userId, fetchCart]);

  const addToCart = async (itemId: string, itemType: ItemType) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId, itemType })
      });

      if (res.status === 409) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const newItem: Cart = await res.json();

      setCart((prev) => [...prev, newItem]);

      toast.success('Added to cart!');
    } catch (err) {
      toast.error(`Failed to add Cart:${err}`);
    }
  };

  const removeFromCart = async (itemIds: string[]) => {
    try {
      const ids = Array.isArray(itemIds) ? itemIds : [itemIds];

      const res = await fetch(`/api/cart?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: ids })
      });

      if (!res.ok) {
        throw new Error(`Status code: ${res.status}`);
      }

      setCart((prev) => prev.filter((item) => !ids.includes(item.itemId)));

      toast.success(`${ids.length} item(s) removed from cart`);

      fetchCart();
    } catch (err) {
      toast.error(`Failed to remove cart item(s): ${err}`);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

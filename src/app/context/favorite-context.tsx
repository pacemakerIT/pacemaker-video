'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ItemType } from '@prisma/client'; // enum import
import { toast } from 'sonner';

export type Favorite = {
  itemId: string;
  itemType: ItemType; // enum 기반
};

interface FavoriteContextType {
  favorites: Favorite[];
  addFavorite: (itemId: string, itemType: ItemType) => Promise<void>;
  removeFavorite: (itemId: string, itemType: ItemType) => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(
  undefined
);

export const FavoriteProvider = ({
  userId,
  children
}: {
  userId: string;
  children: React.ReactNode;
}) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`/api/favorites?userId=${userId}`);
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        toast.error(`Failed to fetch favorites: ${err}`);
      }
    };

    fetchFavorites();
  }, [userId]);

  const addFavorite = async (itemId: string, itemType: ItemType) => {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId, itemType })
      });
      setFavorites((prev) => [...prev, { itemId, itemType }]);
    } catch (err) {
      toast.error(`Failed to add favorite:${err}`);
    }
  };

  const removeFavorite = async (itemId: string, itemType: ItemType) => {
    try {
      await fetch(
        `/api/favorites?userId=${userId}&itemId=${itemId}&itemType=${itemType}`,
        { method: 'DELETE' }
      );
      setFavorites((prev) =>
        prev.filter((f) => !(f.itemId === itemId && f.itemType === itemType))
      );
    } catch (err) {
      toast.error(`Failed to remove favorite:${err}`);
    }
  };

  return (
    <FavoriteContext.Provider
      value={{ favorites, addFavorite, removeFavorite }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavoriteContext = () => {
  const context = useContext(FavoriteContext);
  if (!context)
    throw new Error('useFavorite must be used within FavoriteProvider');
  return context;
};

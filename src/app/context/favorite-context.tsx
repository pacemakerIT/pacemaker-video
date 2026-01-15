'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ItemType, VideoCategory } from '@prisma/client';
import { toast } from 'sonner';
import { useUserContext } from './user-context';

export type Favorite = {
  itemId: string;
  itemType: ItemType;
  id: string;
  title: string;
  price: number;
  description: string;
  category: VideoCategory | null;
  startDate: Date | undefined;
  like: boolean;
};

interface FavoriteContextType {
  favorites: Favorite[];
  addFavorite: (itemId: string, itemType: ItemType) => Promise<void>;
  removeFavorite: (itemId: string) => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(
  undefined
);

export const FavoriteProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUserContext();
  const userId = user?.id;
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      return;
    }

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
      const res = await fetch('/api/favorites', {
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

      const newItem: Favorite = await res.json();
      setFavorites((prev) => [...prev, newItem]);

      toast.success('Added to favorites!');
    } catch (err) {
      toast.error(`Failed to add favorite:${err}`);
    }
  };

  const removeFavorite = async (itemId: string) => {
    try {
      await fetch(`/api/favorites?userId=${userId}&itemId=${itemId}`, {
        method: 'DELETE'
      });
      setFavorites((prev) => prev.filter((f) => !(f.itemId === itemId)));
      toast.success('Removed from favorites!');
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

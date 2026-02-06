import { ItemType } from '@prisma/client';

export interface MyCardBase {
  id: string;
  itemId: string;
  title: string;
}

// Added selected property for the cart list in /mypage/cart
export interface CartItem extends MyCardBase {
  category: string;
  price: number | string;
  type: string;
  date?: Date;
  selected?: boolean;
}

export interface MyCard extends MyCardBase {
  purchased?: boolean; // TODO: May not need after fetching data from db

  category: string;
  type: ItemType;

  // Used in /mypage/page.tsx
  totalChapters?: number;
  completedChapters?: number;

  // Used in You Might Also Like in /mypage/cart/page.tsx and /mypage/favorites
  description?: string;
  price?: number | string;
  like?: boolean;
  date?: Date;
}

export interface MyWorkshopCard extends MyCardBase {
  date: Date;
}

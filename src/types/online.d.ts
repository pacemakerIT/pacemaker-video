import { ItemType } from '@prisma/client';

export interface OnlineCards {
  id: string;
  itemId: string;
  //videoId: string;
  title: string;
  description: string;
  uploadDate: Date;
  price: number;
  category: string;
  watchedVideos: Array;
  purchasedVideos: Array;
  imageUrl?: string;
  itemType?: ItemType;
  thumbnail?: string;
}

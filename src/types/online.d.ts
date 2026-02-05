import { ItemType } from '@prisma/client';

export interface OnlineCards {
  id: string;
  itemId: string;
  //videoId: string;
  courseTitle?: string;
  title?: string;
  summary: string;
  uploadDate: Date;
  price: number;
  category: string;
  watchedVideos: Array;
  purchasedVideos: Array;
  thumbnail?: string;
  itemType?: ItemType;
}

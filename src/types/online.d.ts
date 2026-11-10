import { ItemType } from '@prisma/client';

export interface OnlineCards {
  id: string;
  itemId: string;
  category: string;
  isPublic: boolean;
  showOnMain: boolean;
  title?: string;
  description: string;
  processTitle?: string;
  processContent?: string;
  videoLink?: string;
  price: number;
  thumbnail?: string | null;
  thumbnailUrl?: string;
  visualTitle?: string;
  visualTitle2?: string;
  uploadDate: Date | string;
  createdAt?: Date | string;
  rating?: number;
  reviewCount?: number;
  likes?: number;
  purchases?: number;
  orderKey?: string;
  watchedVideos: unknown[];
  purchasedVideos: unknown[];
  itemType?: ItemType;
  startDate?: string | Date;
  locationOrUrl?: string;
  status?: string;
  imageUrl?: string | null;
}

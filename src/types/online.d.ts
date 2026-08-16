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
  thumbnail?: string;
  thumbnailUrl?: string;
  visualTitle?: string;
  visualTitle2?: string;
  uploadDate: Date;
  rating?: number;
  watchedVideos: unknown[];
  purchasedVideos: unknown[];
  itemType?: ItemType;
  thumbnail?: string | null;
  startDate?: string | Date;
  locationOrUrl?: string;
  status?: string;
  imageUrl?: string | null;
}

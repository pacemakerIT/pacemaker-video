export interface OnlineCards {
  id: string;
  videoId: string;
  title: string;
  description: string;
  uploadDate: Date;
  price: number;
  category: string;
  watchedVideos: Array;
  purchasedVideos: Array;
  thumbnail: string;
  // id: string;
  // title: string;
  // price: number;
  // description: string;
  // image: StaticImageData;
  // category: 'Interview' | 'Resume' | 'Networking' | undefined;
}

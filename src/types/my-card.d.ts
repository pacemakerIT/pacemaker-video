// Used in /mypage/cart
// TODO: Make scalable for both item type - video, document
export interface MyCard {
  // id: string;
  videoId: string;
  title: string;
  description: string;
  // uploadDate: Date;
  price: number;
  category: string;
  type: string;
  // watchedVideos: Array;
  // purchasedVideos: Array;
}

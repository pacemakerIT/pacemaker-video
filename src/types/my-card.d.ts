// Used in /mypage/cart
// TODO: Make scalable for both item type - video, document
export interface MyCard {
  id: string;
  videoId: string;
  title: string;
  description: string;
  // uploadDate: Date;
  date?: Date;
  price: number;
  category: string;
  type: string;
  // watchedVideos: Array;
  // purchasedVideos: Array;
}

// Added selected property for the cart list in /mypage/cart
export interface CartItem extends MyCard {
  selected: boolean;
}

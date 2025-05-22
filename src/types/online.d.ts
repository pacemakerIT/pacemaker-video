export interface OnlineCards {
  id: string;
  title: string;
  price: number;
  description: string;
  image: StaticImageData;
  category: 'Interview' | 'Resume' | 'Networking' | undefined;
}

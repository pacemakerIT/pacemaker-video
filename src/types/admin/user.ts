export interface UserRow {
  id: number;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  role: 'admin' | 'user' | 'instructor';
  selected: boolean;
  purchases?: {
    lectures: number;
    ebooks: number;
    workshops: number;
  };
}

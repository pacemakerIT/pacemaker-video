export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  INSTRUCTOR = 'INSTRUCTOR'
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  role: UserRole;
  selected: boolean;
  purchases?: {
    lectures: number;
    ebooks: number;
    workshops: number;
  };
}

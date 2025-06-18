export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  image: string | null;
  roleId: string;
  isSubscribed: boolean;
  subscriptionEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

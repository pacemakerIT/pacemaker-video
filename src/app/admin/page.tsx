import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
  });
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (role !== 'admin') {
    redirect('/');
  }

  return <div>AdminDashboard</div>;
}

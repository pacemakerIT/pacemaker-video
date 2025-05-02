import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase';

export default async function AdminDashboard() {
  const { userId } = await auth();

  const supabase = createClientSupabase();
  if (!userId) {
    redirect('/sign-in');
  }

  const { data: currentUser, error } = await supabase
    .from('UserPublicView')
    .select('role')
    .eq('clerkId', userId)
    .single();

  if (error || !currentUser) {
    redirect('/');
  }

  if (currentUser.role !== 'ADMIN') {
    redirect('/');
  }

  return <div>AdminDashboard</div>;
}

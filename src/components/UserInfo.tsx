'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import { toast } from 'sonner';

const UserInfo = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          toast('Failed to fetch videos');
        }
      } catch (error) {
        if (error instanceof Error) {
          toast(`Failed to connect server: ${error.message}`);
        } else {
          toast('Failed to connect server: Unknown error');
        }
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>ClerkId: {user.clerkId}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default UserInfo;

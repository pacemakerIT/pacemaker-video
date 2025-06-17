'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { User } from '@/types/user';
import { toast } from 'sonner';

const UserInfo = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            setUserInfo(data[0] as User);
          } else if (!Array.isArray(data) && data) {
            setUserInfo(data as User);
          } else {
            setError('User data not found in database.');
            setUserInfo(null);
          }
        } else {
          const errorData = await res
            .json()
            .catch(() => ({ error: 'Unknown API error' }));
          const message =
            errorData?.error || `Failed to fetch user: ${res.statusText}`;
          setError(message);
          setUserInfo(null);
          if (res.status !== 401) {
            toast.error(message);
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown network error';
        setError(`Failed to connect to server: ${message}`);
        setUserInfo(null);
        toast.error(`Failed to connect to server: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchUserInfo();
    } else if (isLoaded && !isSignedIn) {
      setUserInfo(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return <div>Loading authentication...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to view your information.</div>;
  }

  if (isLoading) {
    return <div>Loading user information...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>Error fetching user data: {error}</div>
    );
  }

  if (userInfo) {
    return (
      <div>
        <h3>User Info (from DB)</h3>
        <p>Name: {userInfo.name || 'N/A'}</p>
        <p>Email: {userInfo.email}</p>
        <p>RoleId: {userInfo.roleId}</p>
        <p>ClerkId: {userInfo.clerkId}</p>
      </div>
    );
  }

  return <div>User data not found.</div>;
};

export default UserInfo;

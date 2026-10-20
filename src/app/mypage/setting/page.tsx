'use client';

import { Interest } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getUserDisplayName, useUserContext } from '@/app/context/user-context';
import { itemCategoryLabel } from '@/constants/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UpdatePasswordForm from '@/components/features/mypage/setting/update-password-form';

export default function SettingsPage() {
  const router = useRouter();
  const { openUserProfile } = useClerk();
  const { user, isLoading, error, updateUser } = useUserContext();

  const [nickname, setNickname] = useState('');
  const [loadingNickname, setLoadingNickname] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loadingInterest, setLoadingInterest] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      toast('Please sign in');
      router.push('/');
      return;
    }

    if (user && user.nickname) {
      setNickname(user.nickname);
    }

    const fetchInterests = async () => {
      if (!user) return;

      try {
        const res = await fetch('/api/interest');
        if (!res.ok) {
          throw new Error(`Failed with status ${res.status}`);
        }

        const data = await res.json();
        setSelectedInterests(data.interest);
      } catch (err) {
        toast.error(`Failed to fetch interests: ${err}`);
      }
    };
    fetchInterests();
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return null;

  const handleSaveNickname = async () => {
    if (!user) return;

    const trimmedNickname = nickname.trim();
    if (trimmedNickname === '') {
      toast.error('Nickname cannot be empty');
      return;
    }
    if (trimmedNickname === user.nickname) {
      toast.info('No changes to save');
      return;
    }

    setLoadingNickname(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: trimmedNickname
        })
      });

      if (!res.ok) throw new Error('Failed to update');

      const newNickName = await res.json();
      updateUser(newNickName);

      toast.success('Your nickname has been updated successfully!');
    } catch (err) {
      toast.error(`Failed to update nickname: ${err}`);
    } finally {
      setLoadingNickname(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSaveInterest = async () => {
    if (!user) return;
    setLoadingInterest(true);
    try {
      const res = await fetch('/api/interest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: selectedInterests })
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Your interests have been updated successfully!');
    } catch (err) {
      toast.error(`Failed to update interests: ${err}`);
    } finally {
      setLoadingInterest(false);
    }
  };

  const joinedDate = new Date(user.createdAt);
  const joinedLabel = Number.isNaN(joinedDate.getTime())
    ? null
    : joinedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });

  return (
    <section className="border border-gray-100 bg-white p-6 shadow-card md:p-10">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h1 className="font-headline text-[1.85rem] font-bold tracking-tight text-navy">
          Settings
        </h1>
      </div>

      <div className="mb-10 mt-6 flex flex-col items-center border-b border-gray-100 pb-8 text-center">
        <h2 className="mb-1 text-2xl font-bold text-navy">
          Hi, {getUserDisplayName(user)}!
        </h2>
        {joinedLabel && (
          <p className="mb-5 text-sm text-body-text/60">
            Joined on {joinedLabel}
          </p>
        )}
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 font-headline text-xs font-semibold text-body-text transition-colors hover:bg-gray-soft"
        >
          <Camera className="h-4 w-4" />
          Change profile photo
        </button>
      </div>

      <div className="mx-auto mb-12 flex w-full max-w-md flex-col items-center">
        <h3 className="mb-4 text-center text-base font-bold text-navy">
          Edit nickname
        </h3>
        <form
          className="flex w-full flex-col items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSaveNickname();
          }}
        >
          <Input
            type="text"
            placeholder="Nickname"
            aria-label="Nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="h-12 w-full rounded-xl border-gray-200 px-4 text-center text-sm text-navy focus-visible:ring-orange"
          />
          <Button
            type="submit"
            className="h-auto rounded-2xl bg-orange px-6 py-2.5 font-headline text-sm font-bold text-white shadow-[0_4px_12px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] hover:bg-orange-hover"
            disabled={loadingNickname}
          >
            {loadingNickname ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </div>

      <div className="mx-auto mb-12 flex w-full max-w-xl flex-col items-center">
        <h3 className="mb-4 text-center text-base font-bold text-navy">
          Update interests
        </h3>
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {Object.values(Interest).map((interest) => (
            <button
              type="button"
              key={interest}
              aria-pressed={selectedInterests.includes(interest)}
              disabled={loadingInterest}
              onClick={() => toggleInterest(interest)}
              className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 font-headline text-xs transition-colors md:px-6 md:text-sm ${selectedInterests.includes(interest) ? 'border-orange bg-orange/5 font-semibold text-orange' : 'border-gray-200 bg-white font-medium text-body-text hover:border-gray-300'}`}
            >
              {itemCategoryLabel.en[interest] ?? interest}
            </button>
          ))}
        </div>
        <Button
          className="h-auto rounded-2xl bg-orange px-6 py-2.5 font-headline text-sm font-bold text-white shadow-[0_4px_12px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] hover:bg-orange-hover"
          onClick={handleSaveInterest}
          disabled={loadingInterest}
        >
          {loadingInterest ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <UpdatePasswordForm />
    </section>
  );
}

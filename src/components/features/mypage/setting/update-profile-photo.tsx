'use client';

import { useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { accountErrorMessage } from '@/lib/account-errors';

export default function UpdateProfilePhoto() {
  const { user, isLoaded } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file || !user || saving) return;
    setError(null);
    if (
      !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
        file.type
      )
    ) {
      setError('Please choose a JPG, PNG, GIF, or WebP image.');
      return;
    }
    setSaving(true);
    try {
      await user.setProfileImage({ file });
      toast.success('Your profile photo has been updated.');
    } catch (err) {
      setError(accountErrorMessage(err, 'Failed to update profile photo.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        aria-label="Profile photo"
        className="sr-only"
        disabled={!isLoaded || !user || saving}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          void upload(file);
        }}
      />
      <button
        type="button"
        disabled={!isLoaded || !user || saving}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 font-headline text-xs font-semibold text-body-text transition-colors hover:bg-gray-soft disabled:opacity-50"
      >
        <Camera aria-hidden="true" className="h-4 w-4" />
        {saving ? 'Uploading...' : 'Change profile photo'}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}

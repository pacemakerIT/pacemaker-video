'use client';

import { useRef, useState } from 'react';
import { useReverification, useUser } from '@clerk/nextjs';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { accountErrorMessage } from '@/lib/account-errors';

export default function UpdatePasswordForm() {
  const { user, isLoaded } = useUser();
  const currentRef = useRef<HTMLInputElement | null>(null);
  const newRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const updatePassword = useReverification(
    (params: { currentPassword?: string; newPassword: string }) => {
      if (!user) throw new Error('Please sign in to update your password.');
      return user.updatePassword({ ...params, signOutOfOtherSessions: true });
    }
  );

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;
    setStatus(null);

    const currentPassword = currentRef.current?.value ?? '';
    const newPassword = newRef.current?.value ?? '';
    const confirmPassword = confirmRef.current?.value ?? '';

    if (
      (user.passwordEnabled && !currentPassword) ||
      !newPassword ||
      !confirmPassword
    ) {
      return setStatus('Please fill out all password fields.');
    }
    if (newPassword !== confirmPassword) {
      return setStatus('New passwords do not match.');
    }

    setSaving(true);
    try {
      const updated = await updatePassword({
        ...(user.passwordEnabled && { currentPassword }),
        newPassword
      });
      if (!updated) return;
      setStatus('');
      toast.success('Password updated successfully.');
      if (currentRef.current) currentRef.current.value = '';
      if (newRef.current) newRef.current.value = '';
      if (confirmRef.current) confirmRef.current.value = '';
    } catch (err) {
      setStatus(accountErrorMessage(err, 'Failed to update password.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="mx-auto mb-6 flex w-full max-w-md flex-col items-center gap-3"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <p className="mb-1 text-center text-base font-bold text-navy">
        {user?.passwordEnabled ? 'Change password' : 'Set password'}
      </p>

      <div className="flex w-full flex-col gap-3">
        {user?.passwordEnabled && (
          <div className="relative">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Current password"
              aria-label="Current password"
              ref={currentRef}
              className="h-12 rounded-xl border-gray-200 px-10 text-center text-sm text-navy focus-visible:ring-orange"
            />
            <button
              type="button"
              aria-label={
                showCurrentPassword
                  ? 'Hide current password'
                  : 'Show current password'
              }
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-body-text hover:text-navy"
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        )}

        <div className="relative">
          <Input
            type={showNewPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="New password"
            aria-label="New password"
            ref={newRef}
            className="h-12 rounded-xl border-gray-200 px-10 text-center text-sm text-navy focus-visible:ring-orange"
          />
          <button
            type="button"
            aria-label={
              showNewPassword ? 'Hide new password' : 'Show new password'
            }
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-body-text hover:text-navy"
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Confirm new password"
            aria-label="Confirm new password"
            ref={confirmRef}
            className="h-12 rounded-xl border-gray-200 px-10 text-center text-sm text-navy focus-visible:ring-orange"
          />
          <button
            type="button"
            aria-label={
              showConfirmPassword
                ? 'Hide password confirmation'
                : 'Show password confirmation'
            }
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-body-text hover:text-navy"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isLoaded || !user || saving}
        className="h-auto rounded-2xl bg-orange px-6 py-2.5 font-headline text-sm font-bold text-white shadow-[0_4px_12px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] hover:bg-orange-hover"
      >
        {saving
          ? 'Saving...'
          : user?.passwordEnabled
            ? 'Update password'
            : 'Set password'}
      </Button>

      {status && (
        <p role="alert" className="text-center text-sm text-body-text">
          {status}
        </p>
      )}
    </form>
  );
}

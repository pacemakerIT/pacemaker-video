import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UpdatePasswordForm from './update-password-form';
import UpdateProfilePhoto from './update-profile-photo';

const mocks = vi.hoisted(() => ({
  user: {
    passwordEnabled: true,
    updatePassword: vi.fn(),
    setProfileImage: vi.fn()
  },
  reverify: vi.fn(),
  success: vi.fn()
}));
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: mocks.user, isLoaded: true }),
  useReverification: (action: (...args: never[]) => unknown) => {
    mocks.reverify(action);
    return action;
  }
}));
vi.mock('sonner', () => ({ toast: { success: mocks.success } }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.passwordEnabled = true;
  mocks.user.updatePassword.mockResolvedValue(mocks.user);
  mocks.user.setProfileImage.mockResolvedValue({});
});
afterEach(cleanup);

function fillPassword(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label, { exact: true }), {
    target: { value }
  });
}

describe('Account password settings', () => {
  it('uses reverification and preserves spaces in passwords', async () => {
    render(<UpdatePasswordForm />);
    fillPassword('Current password', ' current password ');
    fillPassword('New password', ' new password ');
    fillPassword('Confirm new password', ' new password ');
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    await waitFor(() => expect(mocks.success).toHaveBeenCalled());
    expect(mocks.reverify).toHaveBeenCalled();
    expect(mocks.user.updatePassword).toHaveBeenCalledWith({
      currentPassword: ' current password ',
      newPassword: ' new password ',
      signOutOfOtherSessions: true
    });
  });

  it('allows social accounts to set a password without a current password', async () => {
    mocks.user.passwordEnabled = false;
    render(<UpdatePasswordForm />);
    expect(
      screen.queryByLabelText('Current password', { exact: true })
    ).toBeNull();
    fillPassword('New password', 'new password');
    fillPassword('Confirm new password', 'new password');
    fireEvent.click(screen.getByRole('button', { name: 'Set password' }));
    await waitFor(() =>
      expect(mocks.user.updatePassword).toHaveBeenCalledWith({
        newPassword: 'new password',
        signOutOfOtherSessions: true
      })
    );
  });

  it('shows Clerk validation errors and retains fields for correction', async () => {
    mocks.user.updatePassword.mockRejectedValue({
      errors: [{ longMessage: 'The current password is incorrect.' }]
    });
    render(<UpdatePasswordForm />);
    fillPassword('Current password', 'incorrect');
    fillPassword('New password', 'new password');
    fillPassword('Confirm new password', 'new password');
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The current password is incorrect.'
    );
    expect(screen.getByLabelText('New password', { exact: true })).toHaveValue(
      'new password'
    );
    expect(mocks.success).not.toHaveBeenCalled();
  });
});

describe('Profile photo settings', () => {
  it('uploads the selected image to the signed-in Clerk account', async () => {
    render(<UpdateProfilePhoto />);
    const file = new File(['image'], 'profile.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Profile photo'), {
      target: { files: [file] }
    });
    await waitFor(() => expect(mocks.success).toHaveBeenCalled());
    expect(mocks.user.setProfileImage).toHaveBeenCalledWith({ file });
  });

  it('shows upload failures rather than reporting success', async () => {
    mocks.user.setProfileImage.mockRejectedValue({
      errors: [{ message: 'Image is too large.' }]
    });
    render(<UpdateProfilePhoto />);
    fireEvent.change(screen.getByLabelText('Profile photo'), {
      target: {
        files: [new File(['image'], 'profile.png', { type: 'image/png' })]
      }
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Image is too large.'
    );
    expect(mocks.success).not.toHaveBeenCalled();
  });
});

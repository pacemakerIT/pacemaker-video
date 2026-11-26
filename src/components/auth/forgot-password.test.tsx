import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ForgotPassword from '@/components/auth/forgot-password';
import { RESET_ERRORS } from '@/lib/auth-errors';

const create = vi.fn();
const attemptFirstFactor = vi.fn();
const setActive = vi.fn();

vi.mock('@clerk/nextjs/legacy', () => ({
  useSignIn: () => ({
    isLoaded: true,
    signIn: { create, attemptFirstFactor },
    setActive
  })
}));

const clerkError = (code: string) => ({ errors: [{ code }] });

const renderFlow = () => {
  const props = {
    onBack: vi.fn(),
    onNeedsSecondFactor: vi.fn(),
    onFinish: vi.fn()
  };
  render(<ForgotPassword initialEmail="alex@example.com" {...props} />);
  return props;
};

const goToResetStep = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'SEND CODE' }));
  await screen.findByText('Check your email');
};

const fillReset = (code: string, password: string, confirm = password) => {
  fireEvent.paste(screen.getByLabelText('Digit 1'), {
    clipboardData: { getData: () => code }
  });
  fireEvent.change(screen.getByLabelText('New password'), {
    target: { value: password }
  });
  fireEvent.change(screen.getByLabelText('Confirm new password'), {
    target: { value: confirm }
  });
  fireEvent.click(screen.getByRole('button', { name: 'RESET PASSWORD' }));
};

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mockResolvedValue({});
  });

  it('sends a reset code to the prefilled email', async () => {
    renderFlow();
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'alex@example.com'
    );

    await goToResetStep();

    expect(create).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      identifier: 'alex@example.com'
    });
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
  });

  it('does not reveal whether an email has an account', async () => {
    create.mockRejectedValue(clerkError('form_identifier_not_found'));
    renderFlow();

    await goToResetStep();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the Google-only message on the email step', async () => {
    create.mockRejectedValue(clerkError('strategy_for_user_invalid'));
    renderFlow();

    fireEvent.click(screen.getByRole('button', { name: 'SEND CODE' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      RESET_ERRORS.googleOnly.message
    );
    expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
  });

  it('checks the code length and passwords before calling Clerk', async () => {
    renderFlow();
    await goToResetStep();

    fillReset('123', 'longenough1');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      RESET_ERRORS.incompleteCode.message
    );

    fillReset('123456', 'short');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      RESET_ERRORS.shortPassword.message
    );

    fillReset('123456', 'longenough1', 'different1');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      RESET_ERRORS.mismatch.message
    );

    expect(attemptFirstFactor).not.toHaveBeenCalled();
  });

  it('shows our copy when Clerk rejects the code', async () => {
    attemptFirstFactor.mockRejectedValue(clerkError('form_code_incorrect'));
    renderFlow();
    await goToResetStep();

    fillReset('123456', 'longenough1');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      RESET_ERRORS.wrongCode.message
    );
  });

  it('resets the password, signs in, and finishes', async () => {
    attemptFirstFactor.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_1'
    });
    const props = renderFlow();
    await goToResetStep();

    fillReset('424242', 'longenough1');

    expect(await screen.findByText('Password updated')).toBeInTheDocument();
    expect(attemptFirstFactor).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      code: '424242',
      password: 'longenough1'
    });
    expect(setActive).toHaveBeenCalledWith({ session: 'sess_1' });

    fireEvent.click(screen.getByRole('button', { name: 'CONTINUE' }));
    expect(props.onFinish).toHaveBeenCalled();
  });

  it('hands off to two-step verification when Clerk asks for it', async () => {
    const result = { status: 'needs_second_factor', createdSessionId: null };
    attemptFirstFactor.mockResolvedValue(result);
    const props = renderFlow();
    await goToResetStep();

    fillReset('424242', 'longenough1');

    await waitFor(() =>
      expect(props.onNeedsSecondFactor).toHaveBeenCalledWith(result)
    );
    expect(setActive).not.toHaveBeenCalled();
  });

  it('resends the code and shows a notice', async () => {
    renderFlow();
    await goToResetStep();

    fireEvent.click(screen.getByRole('button', { name: 'Resend' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'We sent a new code.'
    );
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('goes back to the sign-in form', () => {
    const props = renderFlow();
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(props.onBack).toHaveBeenCalled();
  });
});

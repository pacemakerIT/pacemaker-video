import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
      <div id="clerk-captcha" />
    </>
  );
}

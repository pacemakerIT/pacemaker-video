'use client';

import CustomAuthWrapper from '@/components/auth/custom-auth-wrapper';

export default function SignInPage() {
  return <CustomAuthWrapper isPage initialMode="signin" />;
}

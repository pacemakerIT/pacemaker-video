'use client';

import CustomAuthWrapper from '@/components/auth/custom-auth-wrapper';

export default function SignUpPage() {
  return <CustomAuthWrapper isPage initialMode="signup" />;
}

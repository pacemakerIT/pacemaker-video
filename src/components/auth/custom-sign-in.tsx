'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInWithGoogleButton from '@/components/auth/sign-in-google-button';

type Props = {
  closeModal?: () => void;
  switchToSignUp?: () => void; // 전환 콜백
};

type SignInAttemptResult = {
  status:
    | 'needs_identifier'
    | 'needs_first_factor'
    | 'needs_second_factor'
    | 'needs_new_password'
    | 'complete'
    | null;
  supportedSecondFactors?: Array<{
    strategy: string;
    emailAddressId?: string;
    safeIdentifier?: string;
  }> | null;
  createdSessionId: string | null;
};

export default function CustomSignIn({ closeModal, switchToSignUp }: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [secondFactorEmail, setSecondFactorEmail] = useState('');
  const [secondFactorEmailId, setSecondFactorEmailId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const finishSignIn = async (sessionId: string | null) => {
    if (!sessionId) {
      setError('로그인 세션을 생성하지 못했어요. 다시 시도해주세요.');
      return;
    }

    if (!setActive) {
      setError('로그인 세션을 활성화하지 못했어요. 다시 시도해주세요.');
      return;
    }

    await setActive({ session: sessionId });
    closeModal?.();
    router.push('/');
  };

  const prepareEmailSecondFactor = async (
    currentSignIn: NonNullable<typeof signIn>,
    result: SignInAttemptResult
  ) => {
    const emailCodeFactor = result.supportedSecondFactors?.find(
      (factor) => factor.strategy === 'email_code'
    );

    if (!emailCodeFactor) {
      setError('지원되는 이메일 인증 수단을 찾지 못했어요.');
      return;
    }

    await currentSignIn.prepareSecondFactor({
      strategy: 'email_code',
      ...(emailCodeFactor.emailAddressId
        ? { emailAddressId: emailCodeFactor.emailAddressId }
        : {})
    });

    setSecondFactorEmail(emailCodeFactor.safeIdentifier ?? email);
    setSecondFactorEmailId(emailCodeFactor.emailAddressId ?? '');
    setCode('');
    setIsVerifyingCode(true);
    setError('');
    setNotice('인증 코드를 이메일로 보냈어요.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        strategy: 'password',
        identifier: email,
        password: pw
      });

      if (result.status === 'complete') {
        await finishSignIn(result.createdSessionId);
      } else if (result.status === 'needs_second_factor') {
        await prepareEmailSecondFactor(signIn, result);
      } else if (result.status === 'needs_new_password') {
        setError('새 비밀번호 설정이 필요합니다.');
      } else {
        setError('로그인을 완료하려면 추가 인증 단계가 필요합니다.');
      }
    } catch (err: unknown) {
      const e = err as { errors?: { code?: string; message?: string }[] };
      setError(e.errors?.[0]?.message || '로그인 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySecondFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: code.trim()
      });

      if (result.status === 'complete') {
        await finishSignIn(result.createdSessionId);
      } else {
        setError('인증을 완료하지 못했어요. 코드를 다시 확인해주세요.');
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      setError(e.errors?.[0]?.message || '인증 코드 확인에 실패했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendSecondFactor = async () => {
    if (!isLoaded || !signIn) return;

    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      await signIn.prepareSecondFactor({
        strategy: 'email_code',
        ...(secondFactorEmailId ? { emailAddressId: secondFactorEmailId } : {})
      });
      setNotice('인증 코드를 다시 보냈어요.');
    } catch (err: unknown) {
      const e = err as { errors?: { message?: string }[] };
      setError(e.errors?.[0]?.message || '인증 코드 재전송에 실패했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifyingCode) {
    return (
      <div className="w-full flex flex-col items-center text-pace-base">
        <form
          onSubmit={handleVerifySecondFactor}
          className="w-full flex flex-col items-center"
        >
          <p className="w-[400px] text-sm text-center text-pace-black-500 mb-6">
            {secondFactorEmail || email}로 전송된 인증 코드를 입력해주세요.
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="인증 코드"
            className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 mb-0"
            required
          />
          {notice && (
            <p className="text-pace-stone-500 text-sm text-center">{notice}</p>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pace-orange-800 hover:bg-pace-orange-600 text-white rounded-full py-3 mt-6 mb-4 disabled:opacity-60"
          >
            인증하고 로그인
          </button>
        </form>

        <button
          type="button"
          onClick={handleResendSecondFactor}
          disabled={isSubmitting}
          className="text-pace-gray-500 underline hover:text-pace-orange-800 disabled:opacity-60"
        >
          인증 코드 다시 보내기
        </button>
        <button
          type="button"
          onClick={() => {
            setIsVerifyingCode(false);
            setCode('');
            setNotice('');
            setError('');
          }}
          className="mt-4 text-pace-stone-500 underline hover:text-pace-orange-800"
        >
          이메일로 다시 로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center text-pace-base">
      <SignInWithGoogleButton />
      <p className="w-[400px] text-pace-base font-bold text-pace-black-500 text-center mb-6">
        혹은
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 mb-6"
          required
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 mb-0"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pace-orange-800 hover:bg-pace-orange-600 text-white rounded-full py-3 mt-6 mb-6 disabled:opacity-60"
        >
          로그인 하기
        </button>
      </form>

      <p className="text-pace-base font-normal text-pace-stone-500 text-center">
        회원이 아니신가요?{' '}
        <button
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('switchToSignUp clicked');
            switchToSignUp?.(); // ← 여기서 Wrapper의 setMode('signup') 호출
          }}
          className="text-pace-gray-500 underline hover:text-pace-orange-800"
        >
          회원가입 하기
        </button>
      </p>
    </div>
  );
}

'use client';

import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import CustomSignInWrapper from '@/components/auth/custom-sign-in-wrapper';
import SignUpWithGoogleButton from '@/components/auth/sign-up-google-button';
import { createPortal } from 'react-dom'; // 포털로 렌더링

type Props = {
  closeModal?: () => void;
};

export default function CustomSignUp({ closeModal }: Props) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: email,
        password: pw,
        unsafeMetadata: {
          firstName: first_name,
          lastName: last_name
        }
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code'
      });
      setPendingVerification(true);
    } catch (err: unknown) {
      const error = err as {
        errors?: { code?: string; message?: string }[];
      };

      const errorList = error?.errors ?? [];

      const emailExistsError = errorList.find(
        (e) => e.code === 'form_identifier_exists'
      );

      if (emailExistsError) {
        const msg = '이미 가입된 이메일입니다. 로그인 해주세요.';
        setError(msg);
        toast.error(msg);
      } else {
        const fallbackMessage =
          errorList[0]?.message || '알 수 없는 오류가 발생했어요.';
        setError(fallbackMessage);
        toast.error(`회원가입 중 오류가 발생했어요: ${fallbackMessage}`);
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code
      });
      await setActive({ session: completeSignUp.createdSessionId });
      closeModal?.();
      router.push('/');
    } catch (error) {
      toast(`Failed to connect server: ${error}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center text-pace-base">
      {!pendingVerification ? (
        <>
          <SignUpWithGoogleButton />
          <p className="w-[400px] text-pace-base font-bold text-pace-black-500 text-center mb-6">
            혹은
          </p>

          <form
            onSubmit={handleSignUp}
            className="w-full flex flex-col items-center"
          >
            <div className="w-[400px] flex gap-2 mb-6">
              <input
                type="text"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="이름"
                className="w-1/2 rounded-full border border-pace-stone-700 px-4 py-3 text-pace-base font-normal placeholder-pace-stone-800"
                required
              />
              <input
                type="text"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="성"
                className="w-1/2 rounded-full border border-pace-stone-700 px-4 py-3 text-pace-base font-normal placeholder-pace-stone-800"
                required
              />
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 text-pace-base font-normal placeholder-pace-stone-800 mb-6"
              required
            />
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호"
              className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 text-pace-base font-normal placeholder-pace-stone-800 mb-0"
              required
            />

            {/* CAPTCHA */}
            <div
              id="clerk-captcha"
              data-cl-theme="auto"
              data-cl-size="flexible"
              data-cl-language="ko"
              className="mt-6 !mb-0 !pb-0"
              style={{ marginBottom: '0px', paddingBottom: '0px' }}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="
                w-full
                bg-pace-orange-800 hover:bg-pace-orange-600
                text-white text-pace-base font-medium rounded-full
                py-3
                mt-0 mb-6
                sm:mt-0 sm:mb-8
                md:mt-[0px] md:mb-[40px]
              "
            >
              가입하기
            </button>
          </form>

          <p className="text-pace-base font-normal text-pace-stone-500 text-center">
            이미 회원이신가요?{' '}
            <span
              onClick={() => setIsSignInOpen(true)}
              className="text-pace-gray-500 underline hover:text-pace-orange-800 cursor-pointer"
            >
              로그인 하기
            </span>
          </p>

          {/* 모달 (Portal로 body에 렌더링: 화면 전체 덮임) */}
          {isSignInOpen &&
            createPortal(
              <div
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-[1000]"
                onClick={() => setIsSignInOpen(false)}
              >
                <div
                  className="w-full max-w-[480px] bg-white rounded-lg px-6 py-10 sm:px-10 sm:py-16   md:px-[40px] md:py-[80px] flex flex-col gap-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CustomSignInWrapper
                    isPage={false}
                    closeModal={() => setIsSignInOpen(false)}
                  />
                </div>
              </div>,
              document.body
            )}
        </>
      ) : (
        <form
          onSubmit={handleVerify}
          className="w-full flex flex-col items-center"
        >
          <p className="text-sm text-center text-pace-black-500 mb-6">
            입력한 이메일로 인증 코드가 전송되었어요.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="인증 코드"
            className="w-[400px] rounded-full border border-pace-stone-700 px-4 py-3 text-pace-base font-normal placeholder-pace-stone-800 mb-6"
            required
          />
          <button
            type="submit"
            className="w-full bg-pace-orange-800 hover:bg-pace-orange-600 text-white text-pace-base font-medium rounded-full py-3"
          >
            이메일 인증
          </button>
        </form>
      )}
    </div>
  );
}

'use client';

import CustomSignUp from './custom-sign-up';

type Props = {
  isPage?: boolean; // 페이지 버전인지 여부
  closeModal?: () => void; // 모달 닫기 콜백
};

export default function CustomSignUpWrapper({
  isPage = true,
  closeModal
}: Props) {
  const content = (
    <div className="p-6 bg-white rounded w-full max-w-[520px]">
      <h1 className="text-pace-xl font-semibold text-pace-black-500 text-center mb-4">
        회원가입
      </h1>
      <CustomSignUp closeModal={closeModal} />
    </div>
  );

  return isPage ? (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {content}
    </div>
  ) : (
    content
  );
}

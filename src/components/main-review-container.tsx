import React from 'react';
import Image from 'next/image';

const MainReviewContainer = () => {
  return (
    <div className="w-screen relative h-[360px] overflow-hidden bg-pace-orange-600">
      {/* 오른쪽 이미지 */}
      <Image
        src="/img/main-review.png"
        alt="background"
        className="absolute top-0 right-0 h-full max-w-[908px] w-1/2 object-center z-0"
        style={{ pointerEvents: 'none' }}
        width={908}
        height={360}
        priority
      />
      {/* 이미지 위에 올라가는 투명 배경 */}
      <div
        className="absolute top-0 right-0 h-full w-1/2 z-10"
        style={{
          background:
            'linear-gradient(to left, rgba(255,130,54,0.7) 0%, rgba(255,130,54,0) 80%)',
          pointerEvents: 'none'
        }}
      />
      {/* 왼쪽 텍스트/버튼 */}
      <div className="relative z-20 h-full flex items-center justify-center w-3/5">
        <div className="flex flex-col gap-8">
          <h2 className="text-pace-3xl font-normal  text-white mb-4">
            Boost your career with Pacemaker Today!
          </h2>

          <button className="h-[66px] text-pace-lg rounded-full px-6 py-2 bg-white text-pace-orange-600 font-medium w-[234px] shadow hover:bg-orange-100 transition">
            로그인 하고 강의 듣기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainReviewContainer;

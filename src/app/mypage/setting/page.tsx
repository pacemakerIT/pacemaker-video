'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const interestsList = [
  '이력서',
  '인터뷰',
  '네트워킹',
  '마케팅',
  '북미 공무원',
  '재무회계',
  '디자인',
  'IT',
  '서비스'
];

export default function SettingsPage() {
  const [nickname, setNickname] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <section className="p-10 pt-20">
      <h1 className="text-pace-xl font-bold mb-6 text-pace-gray-700">설정</h1>

      <div className="flex flex-col justify-center items-center text-center gap-10">
        <div>
          <p className="text-pace-3xl text-pace-gray-500">
            <span className="font-extrabold">Jamie</span> 님 안녕하세요!
          </p>
          <p className="text-pace-stone-600 font-medium">
            <span>2025-01-01 </span>
            <span>구글 계정으로 가입</span>
          </p>
        </div>

        {/* 프로필 */}
        <div>
          <Image
            src="/img/course_image3.png"
            alt="profile"
            width={240}
            height={240}
            className="rounded-full"
          />
          <Button
            variant="outline"
            className="border border-pace-pace-stone-550 rounded-full mt-4 text-pace-sm text-pace-gray-700"
          >
            프로필 사진 수정
          </Button>
        </div>

        {/* 닉네임 변경 */}
        <div className="flex flex-col w-[300px] gap-4">
          <p className="font-medium text-pace-gray-500 text-[20px]">
            닉네임 변경
          </p>
          <Input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="rounded-full border border-[#777777]"
          />

          <Button className="bg-pace-orange-800 rounded-full text-pace-base text-pace-white-500 font-normal">
            변경
          </Button>
        </div>

        {/* 관심분야 변경 */}
        <div className="flex flex-col gap-4 items-center">
          <p className="font-medium text-pace-gray-500 text-[20px]">
            관심분야 변경
          </p>
          <div className="w-[800px] flex flex-wrap gap-2 justify-center">
            {interestsList.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`w-[120px] px-4 py-2 rounded-full border transition ${
                  selectedInterests.includes(interest)
                    ? 'border-2 border-pace-orange-600 text-pace-orange-600'
                    : 'border-pace-stone-600 text-pace-stone-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <Button className="w-[300px] bg-pace-orange-800 text-white rounded-full font-normal">
            변경
          </Button>
        </div>

        {/* 비밀번호 변경 */}
        <div className="w-[300px] flex flex-col  gap-4">
          <p className="font-medium text-pace-gray-500 text-[20px]">
            비밀번호 변경
          </p>
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="현재 비밀번호를 입력하세요"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-full border-pace-stone-650"
            />
            <Input
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-full border-pace-stone-650"
            />
            <Input
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-full border-pace-stone-650"
            />
          </div>
          <Button className="bg-pace-orange-800 text-white rounded-full">
            변경
          </Button>
        </div>
      </div>
    </section>
  );
}

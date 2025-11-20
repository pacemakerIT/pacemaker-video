'use client';

import { Interest } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getUserDisplayName, useUserContext } from '@/app/context/user-context';
import { itemCategoryLabel } from '@/constants/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UpdatePasswordForm from '@/components/features/mypage/setting/update-password-form';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, error, updateUser } = useUserContext();

  const [nickname, setNickname] = useState('');
  const [loadingNickname, setLoadingNickname] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loadingInterest, setLoadingInterest] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      toast('Please sign in');
      return router.push('/');
    }

    if (user && user.nickname) {
      setNickname(user.nickname);
    }

    const fetchInterests = async () => {
      const res = await fetch(`/api/interest?userId=${user?.id}`);
      const data = await res.json();
      setSelectedInterests(data.interest);
    };
    fetchInterests();
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return null;

  const handleSaveNickname = async () => {
    if (!user) return;

    const trimmedNickname = nickname.trim();
    if (trimmedNickname === '') {
      toast.error('Nickname cannot be empty');
      return;
    }
    if (trimmedNickname === user.nickname) {
      toast.info('No changes to save');
      return;
    }

    setLoadingNickname(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: trimmedNickname
        })
      });

      if (!res.ok) throw new Error('Failed to update');

      const newNickName = await res.json();
      updateUser(newNickName);

      toast.success('Your nickname has been updated successfully!');
    } catch (err) {
      toast.error(`Failed to update nickname: ${err}`);
    } finally {
      setLoadingNickname(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSaveInterest = async () => {
    if (!user) return;
    setLoadingInterest(true);
    try {
      const res = await fetch('/api/interest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, interests: selectedInterests })
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Your interests have been updated successfully!');
    } catch (err) {
      toast.error(`Failed to update interests: ${err}`);
    } finally {
      setLoadingInterest(false);
    }
  };

  return (
    <section className="p-10 pt-20">
      <h1 className="text-pace-xl font-bold mb-6 text-pace-gray-700">설정</h1>

      <div className="flex flex-col justify-center items-center text-center gap-10">
        <div>
          <p className="text-pace-3xl text-pace-gray-500">
            <span className="font-extrabold">{getUserDisplayName(user)}</span>{' '}
            님 안녕하세요!
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

          <Button
            className="bg-pace-orange-800 rounded-full text-pace-base text-pace-white-500 font-normal"
            onClick={handleSaveNickname}
            disabled={loadingNickname}
          >
            {loadingNickname ? '저장중...' : '변경'}
          </Button>
        </div>

        {/* 관심분야 변경 */}
        <div className="flex flex-col gap-4 items-center">
          <p className="font-medium text-pace-gray-500 text-[20px]">
            관심분야 변경
          </p>
          <div className="w-[800px] flex flex-wrap gap-2 justify-center">
            {Object.values(Interest).map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`w-[120px] px-4 py-2 rounded-full border transition ${
                  selectedInterests.includes(interest)
                    ? 'border-2 border-pace-orange-600 text-pace-orange-600'
                    : 'border-pace-stone-600 text-pace-stone-600'
                }`}
              >
                {itemCategoryLabel.ko[interest] ?? interest}
              </button>
            ))}
          </div>
          <Button
            className="w-[300px] bg-pace-orange-800 text-white rounded-full font-normal"
            onClick={handleSaveInterest}
            disabled={loadingInterest}
          >
            {loadingInterest ? '저장중...' : '변경'}
          </Button>
        </div>

        {/* 비밀번호 변경 */}
        <UpdatePasswordForm />
      </div>
    </section>
  );
}

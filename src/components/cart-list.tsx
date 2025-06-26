'use client';

import Image from 'next/image';
import { XIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import img from '../../public/img/resume_lecture.jpeg';
import MyPageCard from './my-page-card';
import { CustomBadge } from './CustomBadge';
import { CartItem } from '@/types/my-card';

const cards = [
  {
    id: '1',
    videoId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 12.43,
    description:
      '자소서를 위한 스펙이 무엇인지와, 스펙을 쌓기 위하여 어떻게 정보를 구해야 할지 도와드릴게요.',
    category: 'Marketing',
    type: '전자책'
  },
  {
    id: '2',
    videoId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 15.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    category: 'Interview',
    type: '온라인 강의'
  },
  {
    id: '3',
    videoId: '4e8wv1z7tl',
    title: 'Test3',
    price: 9.99,
    description: 'test3',
    category: 'Resume',
    type: '온라인 강의'
  }
];

interface CartListProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export default function CartList({ cartItems, setCartItems }: CartListProps) {
  const toggleSelect = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAll = (checked: boolean) => {
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, selected: checked }))
    );
  };

  const handleDeleteSelected = () => {
    setCartItems((prev) => prev.filter((item) => !item.selected));
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="flex-1 p-10 pt-20">
      <h1 className="text-pace-xl font-bold mb-6 text-pace-gray-700">
        장바구니
      </h1>

      <div className="flex items-center mb-4 text-pace-sm">
        <Checkbox
          className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
          checked={cartItems.every((item) => item.selected)}
          onCheckedChange={(val) => toggleAll(!!val)}
        />
        <span className="ml-2">전체선택</span>
        <Button
          variant="ghost"
          className="ml-auto text-pace-gray-700 border rounded-full border-[#EEEEEE]"
          onClick={handleDeleteSelected}
        >
          선택삭제
        </Button>
      </div>
      <div className="space-y-4 text-[20px] text-pace-gray-500">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center border-t p-4 !m-0">
            <Checkbox
              checked={item.selected}
              onCheckedChange={() => toggleSelect(item.id)}
              className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
            />
            <div className="w-20 h-4 text-pace-sm text-center text-pace-stone-500 mx-6">
              {item.type}
            </div>
            <Image
              src={img}
              alt={item.title}
              className="w-40 h-[106px] rounded-lg object-cover"
            />
            <div className="ml-6">
              {item.category && (
                <CustomBadge
                  variant={item.category}
                  className="w-fit flex justify-center items-center py-2 px-3"
                >
                  {item.category}
                </CustomBadge>
              )}
              {item.date && (
                <div className="text-pace-sm">
                  {item.date && (
                    <div className="text-pace-sm">
                      {item.date.toISOString().slice(0, 10).replace(/-/g, '.')}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2">{item.title}</div>
            </div>
            <div className="text-right font-semibold text-pace-lg ml-auto">
              ${item.price}
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              className="ml-6 text-gray-400 hover:text-red-500 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <h1 className="text-pace-xl font-bold mt-20 mb-6 text-pace-gray-700">
        You Might Also Like
      </h1>
      <div className="flex gap-6">
        {cards.map((card, index) => (
          <MyPageCard
            key={index}
            id={card.id}
            title={card.title}
            price={card.price}
            description={card.description}
            category={card.category}
            type={card.type}
            videoId={card.videoId}
            // uploadDate={card.uploadDate}
            // watchedVideos={card.watchedVideos}
            // purchasedVideos={card.purchasedVideos}
          />
          // <MyPageCard key={index} {...card} />
        ))}
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import img from '../../public/img/resume_lecture.jpeg';

const items = [
  {
    id: 1,
    type: '온라인 강의',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    tag: 'Interview',
    price: 2800,
    selected: true
  },
  {
    id: 2,
    type: '전자책',
    title: '마케터를 위한 자소서 네트워킹',
    tag: 'Marketing',
    price: 2800,
    selected: false
  },
  {
    id: 3,
    type: '워크샵',
    title: '성공을 부르는 마인드 트레이닝',
    date: '2025.05.10',
    location: 'North York centre',
    price: 20,
    selected: false
  },
  {
    id: 4,
    type: '온라인 강의',
    title: '한번 배워서 평생 써먹는 취업·이직 노하우',
    tag: 'Interview',
    price: 2800,
    selected: false
  }
];

export default function CartPage() {
  const [selectedItems, setSelectedItems] = useState(items);

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedItems((prev) =>
      prev.map((item) => ({ ...item, selected: checked }))
    );
  };

  const handleDeleteSelected = () => {
    setSelectedItems((prev) => prev.filter((item) => !item.selected));
  };

  const handleRemove = (id: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="flex-1 p-10 pt-20">
      <h1 className="text-pace-xl font-bold mb-4 text-pace-gray-700">
        장바구니
      </h1>

      <div className="flex items-center mb-4 text-pace-sm">
        <Checkbox
          checked={selectedItems.every((item) => item.selected)}
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
        {selectedItems.map((item) => (
          <div key={item.id} className="flex items-center border-t p-4 !m-0">
            <Checkbox
              checked={item.selected}
              onCheckedChange={() => toggleSelect(item.id)}
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
              {item.tag && (
                <span
                  className={`text-pace-sm text-pace-white-500 px-3 py-2 rounded-full ${
                    item.tag === 'Interview'
                      ? 'bg-pace-blue-500'
                      : item.tag === 'Marketing'
                        ? 'bg-pace-orange-700'
                        : 'bg-pace-black-900'
                  }`}
                >
                  {item.tag}
                </span>
              )}
              {item.date && <div className="text-pace-sm">{item.date}</div>}
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
    </section>
  );
}

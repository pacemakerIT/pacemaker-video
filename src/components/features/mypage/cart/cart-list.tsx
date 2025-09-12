'use client';

import Image from 'next/image';
import { ItemType } from '@prisma/client';
import { CartItem } from '@/types/my-card';
import { ItemCategoryLabel, itemTypeLabels } from '@/constants/labels';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import MyPageCard from '../my-page-card';
import { CustomBadge } from '../../../common/custom-badge';
import { useCartContext } from '@/app/context/cart-context';
import { toast } from 'sonner';
import { useUserContext } from '@/app/context/user-context';

const cards = [
  {
    id: '1',
    itemId: '49f25e81-52ec-4d2e-9e64-a8a5533d4fe0',
    title: 'UX Design Fundamentals',
    price: 12.43,
    description:
      '자소서를 위한 스펙이 무엇인지와, 스펙을 쌓기 위하여 어떻게 정보를 구해야 할지 도와드릴게요.',
    category: 'Marketing',
    type: ItemType.WORKSHOP
  },
  {
    id: '2',
    itemId: 'wistia_gitlab_interview_001',
    title: 'UX Design Fundamentals',
    price: 15.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    category: 'Interview',
    type: ItemType.VIDEO
  },
  {
    id: '3',
    itemId: 'Celpip_template.pdf',
    title: 'Test3',
    price: 9.99,
    description: 'test3',
    category: 'Resume',
    type: ItemType.DOCUMENT
  }
];

interface CartListProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export default function CartList({ cartItems, setCartItems }: CartListProps) {
  const { removeFromCart } = useCartContext();

  const { user } = useUserContext();
  const userId = user?.id;

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

  const removeSelectedItems = async () => {
    const itemsToRemove = cartItems.filter((item) => item.selected);
    if (itemsToRemove.length === 0) {
      toast.error('No items selected');
      return;
    }
    const itemIds = itemsToRemove.map((item) => item.itemId);

    try {
      const res = await fetch(`/api/cart?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds })
      });

      if (!res.ok) throw new Error(`Status code: ${res.status}`);

      setCartItems((prev) =>
        prev.filter((item) => !itemIds.includes(item.itemId))
      );

      toast.success(`${itemIds.length} item(s) removed`);
    } catch (err) {
      toast.error(`Failed to remove items: ${err}`);
    }
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  return (
    <section className="flex-1 p-10 pt-20">
      <h1 className="text-pace-xl font-bold mb-6 text-pace-gray-700">
        장바구니
      </h1>

      {cartItems.length > 0 ? (
        <>
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
              onClick={removeSelectedItems}
            >
              선택삭제
            </Button>
          </div>
          <div className="space-y-4 text-[20px] text-pace-gray-500">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center border-b p-4 !m-0 ${index == 0 ? 'border-t' : ''}`}
              >
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggleSelect(item.id)}
                  className="data-[state=checked]:bg-pace-orange-800 data-[state=checked]:border-pace-orange-800 data-[state=checked]:text-pace-white-500"
                />
                <div className="w-20 h-4 text-pace-sm text-center text-pace-stone-500 mx-6">
                  {itemTypeLabels[item.type] || item.type}
                </div>
                <Image
                  src="/img/resume_lecture.jpeg"
                  alt={item.title}
                  width={160}
                  height={106}
                  className="w-40 h-[106px] rounded-lg object-cover"
                />
                <div className="ml-6">
                  {item.category && (
                    <CustomBadge
                      variant={
                        ItemCategoryLabel[item.category] ?? item.category
                      }
                      className="w-fit flex justify-center items-center py-2 px-3"
                    >
                      {ItemCategoryLabel[item.category] ?? item.category}
                    </CustomBadge>
                  )}

                  {item.date && (
                    <div className="text-pace-sm">
                      {item.date && (
                        <div className="text-pace-sm">
                          {item.date
                            .toISOString()
                            .slice(0, 10)
                            .replace(/-/g, '.')}
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
                  onClick={() => handleRemove(item.itemId)}
                  className="ml-6 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>장바구니가 비어있습니다.</p>
      )}

      <h1 className="text-pace-xl font-bold mt-20 mb-6 text-pace-gray-700">
        You Might Also Like
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <MyPageCard
            key={index}
            id={card.id}
            title={card.title}
            price={card.price}
            description={card.description}
            category={card.category}
            type={card.type}
            itemId={card.itemId}
            purchased={false}
          />
        ))}
      </div>
    </section>
  );
}

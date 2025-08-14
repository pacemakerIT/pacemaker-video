import Image from 'next/image';
import { CustomBadge } from '@/components/common/custom-badge';
import { CartItem } from '@/types/my-card';
import Link from 'next/link';

const items: CartItem[] = [
  {
    id: '1',
    itemId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 2800,
    category: 'Marketing',
    type: '전자책'
  },
  {
    id: '2',
    itemId: '4e8wv1z7tl',
    title: 'UX Design Fundamentals',
    price: 15.99,
    category: 'Interview',
    type: '온라인 강의'
  },
  {
    id: '3',
    itemId: '4e8wv1z7tl',
    title: '성공을 부르는 마인드 트레이닝',
    price: 20,
    category: '',
    date: new Date('2025-05-10'),
    type: '워크샵'
  },
  {
    id: '4',
    itemId: '4e8wv1z7tl',
    title: 'Test3',
    price: 9.57,
    category: 'Resume',
    type: '온라인 강의'
  }
];

export default function PaymentSuccess() {
  const paymentNumber = 'AA0000';
  return (
    <section className="flex-1 p-10 pt-20">
      <h1 className="mb-20 text-pace-xl font-bold text-pace-gray-700">
        장바구니
      </h1>
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <Image
          src="/icons/check-icon.svg"
          alt="check icon"
          width={32}
          height={32}
        />
        <h1 className="text-[20px] font-medium text-pace-gray-700">결제완료</h1>
        <p className="text-pace-stone-500">
          결제가 완료되었습니다.
          <br />
          결제번호는 <span className="font-semibold">{paymentNumber}</span>{' '}
          입니다.
        </p>
      </div>

      <div className="flex mt-6 gap-4 items-center justify-center text-center">
        <Link
          href="/mypage"
          className="bg-pace-orange-800 px-10 py-4 rounded-full text-pace-white-500 hover:bg-pace-orange-600"
        >
          강의 현황 보러가기
        </Link>
        <Link
          href="/mypage/purchases"
          className="border-2 border-pace-orange-600 px-10 py-4 rounded-full text-pace-orange-600 hover:bg-pace-ivory-500"
        >
          구매내역 보러가기
        </Link>
      </div>

      <div className="mt-20 space-y-4 text-[20px] text-pace-gray-500">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center border-b p-4 !m-0 ${index == 0 ? 'border-t' : ''}`}
          >
            <div className="w-20 h-4 text-pace-sm text-center text-pace-stone-500 mx-6">
              {item.type}
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
              <div className="mt-2 font-bold text-pace-gray-500 text-pace-lg">
                ${item.price}
              </div>
            </div>
            <Link
              href="/purchase"
              className="min-w-[120px] p-4 text-center ml-auto bg-pace-orange-500 rounded-full text-pace-base text-pace-white-500 font-regular"
            >
              {item.type === '워크샵' ? '자세히 보기' : '수강하러 가기'}
            </Link>

            <button className=""></button>
          </div>
        ))}
      </div>
    </section>
  );
}

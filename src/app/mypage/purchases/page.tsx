import PurchasesList from '@/components/features/mypage/purchases/purchases-list';

export default function Purchases() {
  const orders = [
    {
      orderNumber: 'AA1000001',
      items: [
        'UX Design Fundamentals',
        '자기소개서 작성 및 면접 준비까지 하나로!'
      ],
      amount: 4320,
      status: '결제완료'
    },
    {
      orderNumber: 'AA1000002',
      items: [
        '자기소개서 작성 및 면접 준비까지 하나로!',
        '자기소개서 작성 및 면접 준비까지 하나로!'
      ],
      amount: 2800,
      status: '환불진행중'
    },
    {
      orderNumber: 'AA1000003',
      items: [
        '자기소개서 작성 및 면접 준비까지 하나로!',
        '자기소개서 작성 및 면접 준비까지 하나로!'
      ],
      amount: 2800,
      status: '환불완료'
    },
    {
      orderNumber: 'AA1000004',
      items: [
        '자기소개서 작성 및 면접 준비까지 하나로!',
        '자기소개서 작성 및 면접 준비까지 하나로!'
      ],
      amount: 2800,
      status: '환불진행중'
    },
    {
      orderNumber: 'AA1000005',
      items: [
        '자기소개서 작성 및 면접 준비까지 하나로!',
        '자기소개서 작성 및 면접 준비까지 하나로!'
      ],
      amount: 2800,
      status: '환불완료'
    }
  ];

  return (
    <main className="mx-10 mt-20 mb-auto">
      <h1 className="text-pace-xl font-bold mb-6 text-pace-gray-700">
        구매내역
      </h1>
      {orders.map((order, idx) => (
        <PurchasesList key={idx} {...order} isFirst={idx === 0} />
      ))}
    </main>
  );
}

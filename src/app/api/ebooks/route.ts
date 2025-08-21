import { NextResponse } from 'next/server';

export async function GET() {
  const ebooks = [
    {
      id: '1',
      title: '마케터를 위한 자소서 네트워킹',
      description:
        '자소서를 위한 스펙이 무엇인지와, 스펙을 쌓기 위하여 어떻게 정보를 구해야 할지 도와드릴게요.',
      category: 'Marketing',
      price: 2800,
      imageUrl: '/img/ebook-image3.png'
    },
    {
      id: '2',
      title: '코딩 인터뷰 준비하기',
      description:
        '나만의 셀링 포인트를 찾아 이를 이력서에 녹이는 방법을 알 수 있습니다.',
      category: 'Design',
      price: 2800,
      imageUrl: '/img/ebook-image4.png'
    },
    {
      id: '3',
      title: '공공기관 취업 성공 이력서',
      description:
        "'나'를 어떻게 표현하느냐에 따라 부족한 부분을 채우고 타인에게 긍정적인 인상을 남길 수 있습니다.",
      category: 'Public',
      price: 2800,
      imageUrl: '/img/ebook-image5.png'
    },
    {
      id: '4',
      title: '마케터를 위한 자소서 네트워킹',
      description:
        '자소서를 위한 스펙이 무엇인지와, 스펙을 쌓기 위하여 어떻게 정보를 구해야 할지 도와드릴게요.',
      category: 'IT',
      price: 2800,
      imageUrl: '/img/ebook-image6.png'
    },
    {
      id: '5',
      title: '회계 인터뷰 준비하기',
      description:
        '나만의 셀링 포인트를 찾아 이를 이력서에 녹이는 방법을 알 수 있습니다.',
      category: 'Accounting',
      price: 2800,
      imageUrl: '/img/ebook-image7.png'
    },
    {
      id: '6',
      title: '마케터를 위한 자소서 네트워킹',
      description:
        '자소서를 위한 스펙이 무엇인지와, 스펙을 쌓기 위하여 어떻게 정보를 구해야 할지 도와드릴게요.',
      category: 'Service',
      price: 2800,
      imageUrl: '/img/ebook-image8.png'
    },
    {
      id: '7',
      title: '코딩 인터뷰 준비하기',
      description:
        '나만의 셀링 포인트를 찾아 이를 이력서에 녹이는 방법을 알 수 있습니다.',
      category: 'Design',
      price: 2800,
      imageUrl: '/img/ebook-image4.png'
    },
    {
      id: '8',
      title: '공공기관 취업 성공 이력서',
      description:
        "'나'를 어떻게 표현하느냐에 따라 부족한 부분을 채우고 타인에게 긍정적인 인상을 남길 수 있습니다.",
      category: 'Public',
      price: 2800,
      imageUrl: '/img/ebook-image5.png'
    }
  ];

  return NextResponse.json(ebooks);
}

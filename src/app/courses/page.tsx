'use client';
import CardContainer from '@/components/CardContainer';
import resume from '../../../public/img/resume_lecture.jpeg';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { OnlineCards } from '@/types/online';
import ListHeader from '@/components/list-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const cards: OnlineCards[] = [
  {
    id: 'fdsfswfr',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    price: 49.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    image: resume,
    category: 'Interview'
  },
  {
    id: 'ytrnghg',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    price: 49.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    image: resume,
    category: 'Resume'
  },
  {
    id: 'qweqwe',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    price: 49.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    image: resume,
    category: 'Networking'
  },
  {
    id: 'fdgdfgg',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    price: 49.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    image: resume,
    category: 'Interview'
  },
  {
    id: 'ytrhyrth',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    price: 49.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    image: resume,
    category: 'Resume'
  },
  {
    id: 'dhtdh',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    price: 49.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    image: resume,
    category: 'Networking'
  },
  {
    id: 'hfghfh',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    price: 49.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    image: resume,
    category: 'Interview'
  },
  {
    id: 'knoljnb',
    title: '자기소개서 작성 및 면접 준비까지 하나로!',
    price: 49.99,
    description:
      '2~30대의 다양한 선택지를 두루 경험한 제가, 취준 일변도가 아니라 다양한 분야에서 쓰일 수 있는 스펙 쌓기부터 각종 자소서 작성 및 면접 준비까지 차근차근 준비해나가실 수 있도록 도와드리겠습니다.',
    image: resume,
    category: 'Resume'
  }
];

export default function CoursesPage() {
  const category = ['Total', 'Interview', 'Resume', 'Networking'];
  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('total');

  const [currentCards, setCurrentCards] = useState(cards);

  useEffect(() => {
    if (currentCategory !== 'All') {
      const filterCards = cards.filter(
        (card) => card.category === currentCategory
      );
      setCurrentCards(filterCards);
    } else {
      setCurrentCards(cards);
    }
  }, [currentCategory]);

  return (
    <>
      <div className="w-screen flex gap-4 flex-col">
        <ListHeader
          title={'북미 취업의 정석,\n 페이스 메이커 온라인 강의로 준비하세요.'}
          height={'h-[370px]'}
          gradientColors={{
            start: '#A8DBFF60',
            middle: '#FF823610',
            end: '#A8DBFF40'
          }}
        />
        {/* 메인화면 헤더 사용법 - 공유 후 삭제 예정
        <ListHeader
          slides={[
            {
              title: '첫 번째 슬라이드 제목',
              buttonText: '첫 번째 버튼'
            },
            {
              title: '두 번째 슬라이드 제목'
            },
            {
              title: '세 번째 슬라이드 제목',
              buttonText: '세 번째 버튼'
            }
          ]}
          // autoPlayInterval={5000} // 5초마다 자동 전환
          height={'h-[502px]'}
          gradientColors={{
            start: '#FFCDCE',
            middle: '#FF823610',
            end: '#FF823640'
          }}
        /> */}
        <div className="w-[1200px] items-center mx-auto justify-center flex flex-col">
          <div className="flex flex-col justify-start w-full pt-20">
            <h5 className="text-pace-orange-600 text-lg">
              {'다양한 강의를 한 자리에서'}
            </h5>
            <h3 className="text-pace-black-500 text-pace-3xl font-bold">
              {'페이스메이커 온라인 강의'}
            </h3>
          </div>
          <div className="w-full flex gap-4 justify-between items-center pt-8 pb-4">
            <div className="flex gap-4">
              {category.map((categoryName) => (
                <Badge
                  key={categoryName}
                  variant={'outline'}
                  className={`${
                    categoryName === currentCategory
                      ? ' border-pace-orange-600 text-pace-orange-600'
                      : 'text-pace-stone-600 border-pace-stone-600'
                  } rounded-full w-[120px] h-12 justify-center cursor-pointer font-medium hover:text-pace-orange-600 hover:border-pace-orange-600`}
                  onClick={() => {
                    setCurrentCategory(categoryName);
                  }}
                >
                  {categoryName}
                </Badge>
              ))}
            </div>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className="w-[180px] h-12 border-pace-stone-600 text-pace-stone-600">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardContainer layout={'grid'} cards={currentCards} />
        </div>
      </div>
    </>
  );
}

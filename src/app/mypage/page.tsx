import MyList from '@/components/features/mypage/my-list';
import MyPageWorkshopCard from '@/components/features/mypage/my-page-workshop-card';
import { MyCard, MyWorkshopCard } from '@/types/my-card';

export default function MyPage() {
  function formatKoreanDateTime(dateString?: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hour = date.getHours();
    const isPM = hour >= 12;
    const period = isPM ? '오후' : '오전';
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return `${year}년 ${month}월 ${day}일 ${period} ${hour}시`;
  }

  const cardData = [
    {
      type: 'video',
      total: 8,
      inProgress: 5,
      completed: 3
    },
    {
      type: 'document',
      total: 8,
      inProgress: 4,
      notStarted: 4
    },
    {
      type: 'workshop',
      total: 3,
      nextDate: '2025-10-15T19:00:00'
    }
  ];

  const courseCards: MyCard[] = [
    {
      id: '1',
      itemId: '4e8wv1z7tl',
      title: 'UX Design Fundamentals',
      category: 'Marketing',
      type: '온라인 강의',
      purchased: true,
      totalChapters: 8,
      completedChapters: 4
    },
    {
      id: '2',
      itemId: '4e8wv1z7tl',
      title: 'UX Design Fundamentals',
      category: 'Interview',
      type: '온라인 강의',
      purchased: true,
      totalChapters: 8,
      completedChapters: 8
    },
    {
      id: '3',
      itemId: '4e8wv1z7tl',
      title: 'Test3',
      category: 'Resume',
      type: '온라인 강의',
      purchased: true,
      totalChapters: 8,
      completedChapters: 0
    },
    {
      id: '4',
      itemId: '4e8wv1z7tl',
      title: 'Test3',
      category: 'Resume',
      type: '온라인 강의',
      purchased: true,
      totalChapters: 8,
      completedChapters: 0
    },
    {
      id: '5',
      itemId: '4e8wv1z7tl',
      title: 'Test3',
      category: 'Resume',
      type: '온라인 강의',
      purchased: true,
      totalChapters: 8,
      completedChapters: 0
    }
  ];

  const documentCards: MyCard[] = [
    {
      id: '1',
      itemId: '4e8wv1z7tl',
      title: 'UX Design Fundamentals',
      category: 'Marketing',
      type: '전자책',
      purchased: true,
      totalChapters: 8,
      completedChapters: 4
    },
    {
      id: '2',
      itemId: '4e8wv1z7tl',
      title: 'UX Design Fundamentals',
      category: 'Interview',
      type: '전자책',
      purchased: true,
      totalChapters: 8,
      completedChapters: 8
    },
    {
      id: '3',
      itemId: '4e8wv1z7tl',
      title: 'Test3',
      category: 'Resume',
      type: '전자책',
      purchased: true,
      totalChapters: 8,
      completedChapters: 0
    }
  ];

  const workshopCards: MyWorkshopCard[] = [
    {
      id: '1',
      itemId: '4e8wv1z7tl',
      title: 'UX Design Fundamentals',
      date: new Date('2025-03-15T19:00:00')
    },
    {
      id: '2',
      itemId: '4e8wv1z7tl',
      title: 'UX Design Fundamentals',
      date: new Date('2025-12-15T19:00:00')
    },
    {
      id: '3',
      itemId: '4e8wv1z7tl',
      title: 'Test3',
      date: new Date('2025-09-15T16:00:00')
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="w-full h-[416px] px-10 py-20 bg-pace-ivory-500">
        <div className="flex flex-col h-full justify-between">
          <div>
            <h1 className="text-pace-gray-500 font-bold text-pace-3xl mb-4">
              페이스 메이커 강의 페이지입니다!
            </h1>
            <p className="text-pace-stone-700 text-pace-sm">
              마지막 로그인: 2025년 4월 6일 9:30 AM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardData.map((card) => (
              <div
                key={card.type}
                className="h-fit bg-pace-white-500 rounded-lg shadow p-6 flex flex-col justify-between items-center"
              >
                <div className="flex flex-row justify-between items-center w-full">
                  <div>
                    <div className="text-pace-stone-500 mb-4">
                      {card.type === 'video'
                        ? '온라인 강의'
                        : card.type === 'document'
                          ? '전자책'
                          : card.type === 'workshop'
                            ? '워크샵'
                            : ''}
                    </div>
                    <div className="text-pace-stone-600 text-pace-sm">
                      {card.type === 'video'
                        ? `${card.inProgress} 강의 수강 중, ${card.completed} 강의 수강완료`
                        : card.type === 'document'
                          ? `${card.inProgress}개 강의 수강중, ${card.notStarted}개 강의 미수강`
                          : card.type === 'workshop'
                            ? workshopCards && workshopCards.length > 0
                              ? (() => {
                                  const now = new Date();
                                  const upcoming = workshopCards.filter(
                                    (w) => w.date > now
                                  );
                                  if (upcoming.length === 0)
                                    return '예정된 워크샵이 없습니다';
                                  const nearest = upcoming.reduce((a, b) =>
                                    a.date < b.date ? a : b
                                  );
                                  return (
                                    <>
                                      다음 워크샵:{' '}
                                      <span className="text-pace-orange-500">
                                        {formatKoreanDateTime(
                                          nearest.date.toISOString()
                                        )}
                                      </span>
                                    </>
                                  );
                                })()
                              : '예정된 워크샵이 없습니다'
                            : null}
                    </div>
                  </div>
                  <div className="text-pace-orange-600 text-pace-4xl font-bold text-right">
                    {card.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MyList title="내 온라인 강의 목록" cards={courseCards} />
      <MyList title="내 전자책 목록" cards={documentCards} />

      <div className="my-20 mx-10">
        <h1 className="text-pace-gray-700 font-bold text-pace-xl mb-6">
          내 워크샵 목록
        </h1>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshopCards.map((card) => (
              <div key={card.id} className="w-full">
                <MyPageWorkshopCard
                  id={card.id}
                  title={card.title}
                  itemId={card.itemId}
                  date={card.date}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

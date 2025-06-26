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
      nextDate: '2025-04-15T19:00:00'
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

          <div className="flex gap-4">
            {cardData.map((card) => (
              <div
                key={card.type}
                className="h-fit max-w-[400px] bg-pace-white-500 rounded-lg shadow p-6 flex-1 justify-between items-center"
              >
                <div className="flex flex-row justify-between items-center">
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
                      {card.type === 'video' ? (
                        `${card.inProgress} 강의 수강 중, ${card.completed} 강의 수강완료`
                      ) : card.type === 'document' ? (
                        `${card.inProgress}개 강의 수강중, ${card.notStarted}개 강의 미수강`
                      ) : (
                        <>
                          다음 워크샵:{' '}
                          <span className="text-pace-orange-500">
                            {formatKoreanDateTime(card.nextDate)}
                          </span>
                        </>
                      )}
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
    </>
  );
}

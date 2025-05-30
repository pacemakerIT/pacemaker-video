'use client';
import ListHeader from '@/components/list-header';

export default function CoursesPage() {
  return (
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
      {/* 메인화면 헤더 사용법 - 공유 후 삭제 예정 */}
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
      />
    </div>
  );
}

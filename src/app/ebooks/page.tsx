import ListHeader from '@/components/common/list-header';
import LogoCarousel from '@/components/common/logo-marquee';
import ReviewContainer from '@/components/common/review-container';
import CourseList from '@/components/features/course/course-list';

export default function EBooksPage() {
  return (
    <div className="w-screen flex gap-20 flex-col">
      <ListHeader
        // TO-DO : DB 연결 필요
        title={
          '합격률 94%의 비밀: 취업과 이직에서 승리하는\n나만의 관점을 담은 자소서 작성'
        }
        height={'h-[370px]'}
        gradientColors={{
          start: '#FFD262',
          middle: '#FFFFFF',
          end: '#FCF0D7'
        }}
        // TO-DO : DB 연결 필요
        buttonText={'전자책 보러가기'}
      />
      <LogoCarousel />
      {/* TO-DO: PACE-112/main-ebook-card 완료 시 적용 가능 (현재 온라인 강의 페이지)  */}
      <CourseList />
      <ReviewContainer />
    </div>
  );
}

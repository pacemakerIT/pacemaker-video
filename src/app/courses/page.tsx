import ListHeader from '@/components/common/list-header';
import ReviewContainer from '@/components/common/review-container';
import CourseList from '@/components/features/course/course-list';

export default function CoursesPage() {
  return (
    <div className="w-screen flex gap-4 flex-col">
      <ListHeader
        title={'북미 취업의 정석,\n 페이스 메이커 온라인 강의로 준비하세요.'}
        height={'h-[370px]'}
        gradientColors={{
          start: '#A8DBFF60',
          middle: '#FF823610',
          end: '#a5b1b940'
        }}
      />
      <CourseList />
      <ReviewContainer />
    </div>
  );
}

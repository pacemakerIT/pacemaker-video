import ListHeader from '@/components/list-header';
import CourseList from '@/components/CourseList';

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
      <CourseList />
    </div>
  );
}

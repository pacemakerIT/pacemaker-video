import ListHeader from '@/components/common/list-header';
import ReviewContainer from '@/components/common/review-container';
import CourseList from '@/components/features/course/course-list-grid';

export default function CoursesPage() {
  return (
    <div className="w-screen flex gap-20 flex-col">
      <ListHeader
        title={
          'Build a strong foundation\nfor your career abroad with Pacemaker'
        }
        buttonText="Explore Courses"
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

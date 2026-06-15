import ListHeader from '@/components/common/list-header';
import ReviewContainer from '@/components/common/review-container';
import CourseList from '@/components/features/course/course-list-grid';

export default function CoursesPage() {
  return (
    <div className="w-screen flex gap-20 flex-col">
      <ListHeader
        title={'Build a strong foundation\nfor your career abroad'}
        buttonText="Explore courses"
        route="#course-list"
        height={'h-[370px]'}
        showHeroAnimations={true}
      />
      <CourseList />
      <ReviewContainer />
    </div>
  );
}

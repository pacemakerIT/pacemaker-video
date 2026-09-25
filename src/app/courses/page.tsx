import ReviewContainer from '@/components/common/review-container';
import CourseHero from '@/components/features/course/course-hero';
import CourseList from '@/components/features/course/course-list-grid';

export default function CoursesPage() {
  return (
    <div className="w-screen flex flex-col">
      <CourseHero />
      <CourseList />
      <ReviewContainer />
    </div>
  );
}

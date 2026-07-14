import ListHeader from '@/components/common/list-header';
import ReviewContainer from '@/components/common/review-container';
import CourseList from '@/components/features/course/course-list-grid';

export default function CoursesPage() {
  const slides = [
    {
      tag: 'Online Courses',
      tagColor: 'rgba(0, 173, 189, 0.85)',
      title: 'Build a strong foundation\nfor your career abroad ',
      highlight: 'with Pacemaker',
      highlightColor: 'text-teal',
      description:
        'From resumes to interview skills and networking, every step is supported.',
      buttonText: 'Explore courses',
      link: '#course-list'
    }
  ];

  return (
    <div className="w-screen flex gap-20 flex-col">
      <ListHeader
        title={'Build a strong foundation\nfor your career abroad'}
        buttonText="Explore courses"
        route="#course-list"
        height={'h-[370px]'}
        showHeroAnimations={true}
      />
      <div id="course-list">
        <CourseList />
      </div>
      <ReviewContainer />
    </div>
  );
}

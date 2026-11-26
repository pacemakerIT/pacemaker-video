import NotFoundView from '@/components/common/not-found-view';

export default function CourseNotFound() {
  return (
    <NotFoundView
      title="Course not found"
      description="It may have been removed, or the link may be wrong."
      href="/courses"
      label="Browse courses"
    />
  );
}

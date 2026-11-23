import NotFoundView from '@/components/common/not-found-view';

export default function NotFound() {
  return (
    <NotFoundView
      title="Page not found"
      description="The link may be broken, or the page may have moved."
      href="/"
      label="Go to home"
    />
  );
}

'use client';

import ActionButtons from '@/components/admin/common/action-buttons';

type Props = {
  onPreview?: () => void;
  cancelHref?: string;
  submitLabel?: string;
};

export default function CourseActionButtons({
  onPreview,
  cancelHref = '/admin/courses',
  submitLabel = '등록'
}: Props) {
  return (
    <ActionButtons
      onPreview={onPreview}
      cancelHref={cancelHref}
      submitLabel={submitLabel}
      submitBehavior="submit"
    />
  );
}

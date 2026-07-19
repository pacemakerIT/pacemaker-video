'use client';

import ActionButtons from '@/components/admin/common/action-buttons';

type Props = {
  onSubmit: () => void;
  onPreview?: () => void;
  cancelHref?: string;
  submitLabel?: string;
};

export default function EbookActionButtons({
  onSubmit,
  onPreview,
  cancelHref = '/admin/ebooks',
  submitLabel = '수정'
}: Props) {
  return (
    <ActionButtons
      onPreview={onPreview}
      onSubmit={onSubmit}
      cancelHref={cancelHref}
      submitLabel={submitLabel}
      submitBehavior="callback"
    />
  );
}

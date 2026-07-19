'use client';

import DetailSection from '@/components/admin/detail-section';
import { EbookFormErrors } from '@/types/admin/ebook-form-errors';

type Props = {
  title: string;
  setTitle: (v: string) => void;
  intro: string;
  setIntro: (v: string) => void;
  subTitle: string;
  setSubTitle: (v: string) => void;
  subDescription: string;
  setSubDescription: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (v: string) => void;
  fileUrl: string;
  setFileUrl: (v: string) => void;
  errors?: EbookFormErrors;
};

export default function EbookDetailSection(props: Props) {
  return <DetailSection formType="ebook" {...props} />;
}

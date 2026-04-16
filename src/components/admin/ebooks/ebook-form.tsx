'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import EbookSectionList from './sections/ebook-section-list';
import EbookRecommendedSelect from './sections/ebook-recommended-select';
import EbookRecommendedLinkSection from './sections/ebook-recommended-link-section';
import EbookBasicSection from './sections/ebook-basic-section';
import EbookDetailSection from './sections/ebook-detail-section';
import EbookVisualSection from './sections/ebook-visual-section';
import EbookActionButtons from './sections/ebook-action-buttons';
import { EbookFormErrors } from '@/types/admin/ebook-form-errors';
import {
  createEbook,
  updateEbook
} from '@/components/admin/ebooks/actions/ebook-actions';
import { DocumentCategory, TargetAudienceType } from '@prisma/client';

export type EbookData = {
  id?: string;
  category: DocumentCategory | '';
  isPublic: string;
  showOnMain: boolean;
  title: string;
  intro: string;
  subTitle: string;
  subDescription: string;
  price: string;
  thumbnailUrl: string;
  fileUrl: string;
  visualTitle: string;
  visualTitle2: string;
  recommended: TargetAudienceType[];
  sections: {
    title: string;
    content: string;
  }[];
  links: {
    url: string;
    name: string;
    errors?: { url?: string; name?: string };
  }[];
};

type Props = {
  initialData?: EbookData;
  submitLabel?: string;
};

export default function EbookForm({ initialData, submitLabel }: Props) {
  const [ebookData, setEbookData] = useState<EbookData>(
    initialData || {
      category: '',
      isPublic: '',
      showOnMain: false,
      title: '',
      intro: '',
      subTitle: '',
      subDescription: '',
      price: '',
      thumbnailUrl: '',
      fileUrl: '',
      visualTitle: '',
      visualTitle2: '',
      recommended: [],
      sections: [{ title: '', content: '' }],
      links: []
    }
  );

  const [errors, setErrors] = useState<EbookFormErrors>({});

  const handleSubmit = () => {
    const newErrors: EbookFormErrors = {};

    if (!ebookData.category) newErrors.category = '카테고리를 선택해주세요.';
    if (!ebookData.isPublic) newErrors.isPublic = '공개 여부를 선택해주세요.';
    if (!ebookData.title.trim()) newErrors.title = '제목을 입력해주세요.';
    if (!ebookData.intro.trim()) newErrors.intro = '소개를 입력해주세요.';
    if (!ebookData.price.trim()) newErrors.price = '가격을 입력해주세요.';

    if (!ebookData.thumbnailUrl)
      newErrors.thumbnail = '썸네일 이미지를 업로드해주세요.';

    if (!ebookData.fileUrl) newErrors.file = '전자책 파일을 업로드해주세요.';

    if (!ebookData.visualTitle.trim())
      newErrors.visualTitle = '비주얼 타이틀을 입력해주세요.';
    if (!ebookData.visualTitle2.trim())
      newErrors.visualTitle2 = '비주얼 타이틀2를 입력해주세요.';

    // links are optional, but if added they must be valid
    const hasInvalidLink = ebookData.links.some(
      (l) =>
        (l.url.trim() && !l.name.trim()) || (!l.url.trim() && l.name.trim())
    );
    if (hasInvalidLink) newErrors.links = '링크와 이름을 모두 입력해주세요.';

    if (ebookData.recommended.length === 0) {
      newErrors.recommended = '추천 이미지를 최소 1개 선택해주세요.';
    }

    // Sections Validation
    const sectionErrors = ebookData.sections.map((section) => {
      const sectionError: { title?: string; content?: string } = {};
      if (!section.title.trim())
        sectionError.title = '섹션 제목을 입력해주세요.';
      if (!section.content.trim())
        sectionError.content = '섹션 내용을 입력해주세요.';
      return Object.keys(sectionError).length > 0 ? sectionError : {};
    });

    if (sectionErrors.some((err) => Object.keys(err).length > 0)) {
      newErrors.sections = sectionErrors;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('필수 입력 항목을 확인해주세요.');
      return;
    }

    // Call Server Action
    const transition = async () => {
      try {
        if (!ebookData.category) {
          toast.error('카테고리를 선택해주세요.');
          return;
        }

        const payload = {
          ...ebookData,
          category: ebookData.category as DocumentCategory
        };

        if (initialData?.id) {
          await updateEbook(initialData.id, payload);
          toast.success('수정 완료!');
        } else {
          await createEbook(payload);
          toast.success('등록 완료!');
        }
      } catch {
        toast.error('오류가 발생했습니다.');
      }
    };
    transition();
  };

  const updateEbookData = <K extends keyof EbookData>(
    key: K,
    value: EbookData[K]
  ) => {
    setEbookData((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof EbookFormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-8 pt-10 pb-16">
      {/* Basic Info */}
      <EbookBasicSection
        category={ebookData.category}
        setCategory={(v) => {
          updateEbookData('category', v);
          setErrors((prev) => ({ ...prev, category: undefined }));
        }}
        isPublic={ebookData.isPublic}
        setIsPublic={(v) => {
          updateEbookData('isPublic', v);
          setErrors((prev) => ({ ...prev, isPublic: undefined }));
        }}
        showOnMain={ebookData.showOnMain}
        setShowOnMain={(v) => updateEbookData('showOnMain', v)}
        errors={errors}
      />

      {/* Detail Info */}
      <EbookDetailSection
        title={ebookData.title}
        setTitle={(v) => updateEbookData('title', v)}
        intro={ebookData.intro}
        setIntro={(v) => updateEbookData('intro', v)}
        subTitle={ebookData.subTitle}
        setSubTitle={(v) => updateEbookData('subTitle', v)}
        subDescription={ebookData.subDescription}
        setSubDescription={(v) => updateEbookData('subDescription', v)}
        price={ebookData.price}
        setPrice={(v) => updateEbookData('price', v)}
        thumbnailUrl={ebookData.thumbnailUrl}
        setThumbnailUrl={(v) => {
          updateEbookData('thumbnailUrl', v);
          setErrors((prev) => ({ ...prev, thumbnail: undefined }));
        }}
        fileUrl={ebookData.fileUrl}
        setFileUrl={(v) => {
          updateEbookData('fileUrl', v);
          setErrors((prev) => ({ ...prev, file: undefined }));
        }}
        errors={errors}
      />

      {/* Visual Title */}
      <EbookVisualSection
        visualTitle={ebookData.visualTitle}
        setVisualTitle={(v) => updateEbookData('visualTitle', v)}
        visualTitle2={ebookData.visualTitle2}
        setVisualTitle2={(v) => updateEbookData('visualTitle2', v)}
        errors={errors}
      />

      {/* Recommended */}
      <EbookRecommendedSelect
        maxSelect={2}
        value={ebookData.recommended}
        onChange={(v) => updateEbookData('recommended', v)}
        error={errors.recommended}
      />

      {/* Sections */}
      <EbookSectionList
        value={ebookData.sections}
        onChange={(v) => updateEbookData('sections', v)}
        errors={errors.sections}
      />

      {/* Recommended Links */}
      <EbookRecommendedLinkSection
        value={ebookData.links}
        onChange={(v) => updateEbookData('links', v)}
        error={errors.links}
      />

      {/* Actions */}
      <EbookActionButtons
        onSubmit={handleSubmit}
        cancelHref="/admin/ebooks"
        submitLabel={submitLabel}
      />
    </div>
  );
}

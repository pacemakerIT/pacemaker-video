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

export type EbookData = {
  category: string;
  isPublic: string;
  showOnMain: boolean;
  title: string;
  intro: string;
  processTitle: string;
  processContent: string;
  price: string;
  thumbnail: File | null;
  thumbnailUrl: string;
  file: File | null;
  fileUrl: string;
  visualTitle: string;
  visualTitle2: string;
  recommended: string[];
  sections: {
    title: string;
    content: string;
    videos: { title: string; link: string }[];
  }[];
  links: {
    url: string;
    name: string;
    errors?: { url?: string; name?: string };
  }[];
};

type Props = {
  initialData?: EbookData;
};

export default function EbookForm({ initialData }: Props) {
  const [ebookData, setEbookData] = useState<EbookData>(
    initialData || {
      category: '',
      isPublic: '',
      showOnMain: false,
      title: '',
      intro: '',
      processTitle: '',
      processContent: '',
      price: '',
      thumbnail: null,
      thumbnailUrl: '',
      file: null,
      fileUrl: '',
      visualTitle: '',
      visualTitle2: '',
      recommended: [],
      sections: [{ title: '', content: '', videos: [{ title: '', link: '' }] }],
      links: [{ url: '', name: '', errors: {} }]
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

    if (!ebookData.thumbnail && !ebookData.thumbnailUrl)
      newErrors.thumbnail = '썸네일 이미지를 업로드해주세요.';

    if (!ebookData.file && !ebookData.fileUrl)
      newErrors.file = '전자책 파일을 업로드해주세요.';

    if (!ebookData.visualTitle.trim())
      newErrors.visualTitle = '비주얼 타이틀을 입력해주세요.';
    if (!ebookData.visualTitle2.trim())
      newErrors.visualTitle2 = '비주얼 타이틀2를 입력해주세요.';

    const hasInvalidLink = ebookData.links.some(
      (l) => !l.url.trim() || !l.name.trim()
    );
    if (hasInvalidLink) newErrors.links = '링크와 이름을 모두 입력해주세요.';

    if (ebookData.recommended.length === 0) {
      newErrors.recommended = '추천 이미지를 최소 1개 선택해주세요.';
    }

    // Sections Validation
    const sectionErrors = ebookData.sections.map((section) => {
      const errors: { title?: string; content?: string } = {};
      if (!section.title.trim()) errors.title = '섹션 제목을 입력해주세요.';
      if (!section.content.trim()) errors.content = '섹션 내용을 입력해주세요.';
      return Object.keys(errors).length > 0 ? errors : {};
    });

    if (sectionErrors.some((err) => Object.keys(err).length > 0)) {
      newErrors.sections = sectionErrors;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('필수 입력 항목을 확인해주세요.');
      return;
    }

    toast.success('등록 완료!');
  };

  const updateEbookData = <K extends keyof EbookData>(
    key: K,
    value: EbookData[K]
  ) => {
    setEbookData((prev) => ({ ...prev, [key]: value }));
    // EbookFormErrors key check
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
        processTitle={ebookData.processTitle}
        setProcessTitle={(v) => updateEbookData('processTitle', v)}
        processContent={ebookData.processContent}
        setProcessContent={(v) => updateEbookData('processContent', v)}
        price={ebookData.price}
        setPrice={(v) => updateEbookData('price', v)}
        thumbnail={ebookData.thumbnail}
        setThumbnail={(v) => updateEbookData('thumbnail', v)}
        thumbnailUrl={ebookData.thumbnailUrl}
        setThumbnailUrl={(v) => updateEbookData('thumbnailUrl', v)}
        setFile={(v) => updateEbookData('file', v)}
        fileUrl={ebookData.fileUrl}
        setFileUrl={(v) => updateEbookData('fileUrl', v)}
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
      <EbookActionButtons onSubmit={handleSubmit} cancelHref="/admin/ebooks" />
    </div>
  );
}

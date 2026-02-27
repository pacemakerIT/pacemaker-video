export const itemTypeLabels: Record<string, string> = {
  VIDEO: '온라인 강의',
  DOCUMENT: '전자책',
  WORKSHOP: '워크샵'
} as const;

export type ItemType = keyof typeof itemTypeLabels;

export const itemCategoryLabel: Record<'en' | 'ko', Record<string, string>> = {
  en: {
    INTERVIEW: 'Interview',
    RESUME: 'Resume',
    NETWORKING: 'Networking',
    MARKETING: 'Marketing',
    IT: 'IT',
    DESIGN: 'Design',
    PUBLIC: 'Public',
    ACCOUNTING: 'Accounting',
    SERVICE: 'Service',
    TOTAL: 'All Categories'
  },
  ko: {
    INTERVIEW: '인터뷰',
    RESUME: '이력서',
    NETWORKING: '네트워킹',
    MARKETING: '마케팅',
    IT: 'IT',
    DESIGN: '디자인',
    PUBLIC: '북미 공무원',
    ACCOUNTING: '재무회계',
    SERVICE: '서비스',
    TOTAL: '전체 카테고리'
  }
} as const;

export type Category = keyof typeof itemCategoryLabel;

export const itemTypeLabels: Record<string, string> = {
  VIDEO: '온라인 강의',
  DOCUMENT: '전자책',
  WORKSHOP: '워크샵'
} as const;

export type ItemType = keyof typeof itemTypeLabels;

export const itemCategoryLabel: Record<string, string> = {
  INTERVIEW: 'Interview',
  RESUME: 'Resume',
  NETWORKING: 'Networking'
} as const;

export type VideoCategory = keyof typeof itemCategoryLabel;

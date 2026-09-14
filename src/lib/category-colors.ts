export interface CategoryColor {
  bg: string;
  badge: string;
  text: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  MARKETING: {
    bg: 'bg-category-marketing-bg',
    badge: 'bg-category-marketing-badge',
    text: 'text-category-marketing'
  },
  DESIGN: {
    bg: 'bg-category-design-bg',
    badge: 'bg-category-design-badge',
    text: 'text-category-design'
  },
  IT: {
    bg: 'bg-category-it-bg',
    badge: 'bg-category-it',
    text: 'text-category-it'
  },
  PUBLIC: {
    bg: 'bg-category-public-bg',
    badge: 'bg-category-public',
    text: 'text-category-public'
  },
  GOV: {
    bg: 'bg-category-gov-bg',
    badge: 'bg-category-gov-badge',
    text: 'text-category-gov'
  },
  ACCOUNTING: {
    bg: 'bg-category-accounting-bg',
    badge: 'bg-category-accounting',
    text: 'text-category-accounting'
  },
  SERVICE: {
    bg: 'bg-category-service-bg',
    badge: 'bg-category-service',
    text: 'text-category-service'
  },
  RESUME: {
    bg: 'bg-white',
    badge: 'bg-category-resume-badge',
    text: 'text-navy'
  },
  INTERVIEW: {
    bg: 'bg-white',
    badge: 'bg-category-interview-badge',
    text: 'text-navy'
  },
  NETWORKING: {
    bg: 'bg-white',
    badge: 'bg-category-networking-badge',
    text: 'text-navy'
  },
  DEFAULT: {
    bg: 'bg-white',
    badge: 'bg-category-default-badge',
    text: 'text-category-default'
  }
};

export function getCategoryColors(category?: string | null): CategoryColor {
  return (
    CATEGORY_COLORS[category?.toUpperCase() || ''] ?? CATEGORY_COLORS.DEFAULT
  );
}

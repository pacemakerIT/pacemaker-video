export function cartTypeLabel(type: string) {
  return (
    (
      {
        COURSE: 'Online courses',
        VIDEO: 'Online courses',
        EBOOK: 'E-books',
        WORKSHOP: 'Workshops'
      } as Record<string, string>
    )[type] || type
  );
}

export function CartCategory({ category }: { category?: string | null }) {
  if (!category) return null;
  const colors: Record<string, string> = {
    INTERVIEW: 'bg-[#36a6f7]',
    MARKETING: 'bg-[#ff7e54]',
    RESUME: 'bg-pace-purple-500',
    NETWORKING: 'bg-amber-500',
    DESIGN: 'bg-pace-pink-500',
    IT: 'bg-pace-blue-700'
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white sm:px-2.5 sm:text-[10px] ${colors[category.toUpperCase()] || 'bg-teal'}`}
    >
      {category.replaceAll('_', ' ')}
    </span>
  );
}

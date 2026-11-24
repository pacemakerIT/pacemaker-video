interface SectionHeaderProps {
  subtitle?: string;
  title: string;
  className?: string;
}

export default function SectionHeader({
  subtitle,
  title,
  className = ''
}: SectionHeaderProps) {
  return (
    <div
      className={`flex min-w-0 flex-col items-start justify-start text-left ${className}`}
    >
      {subtitle && (
        <p className="mb-2 text-left text-xs font-bold tracking-wide text-orange sm:text-sm">
          {subtitle}
        </p>
      )}
      <h2 className="break-words text-left text-[32px] font-extrabold tracking-tight text-navy font-headline">
        {title}
      </h2>
    </div>
  );
}

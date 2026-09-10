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
    <div className={`flex flex-col justify-start w-full ${className}`}>
      {subtitle && (
        <p className="text-orange font-bold text-sm tracking-wide mb-2">
          {subtitle}
        </p>
      )}
      <h2 className="text-[32px] font-extrabold font-headline text-navy tracking-tight">
        {title}
      </h2>
    </div>
  );
}

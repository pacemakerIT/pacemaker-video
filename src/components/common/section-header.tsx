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
      {subtitle && <p className="text-[#ff4f02] font-bold mb-2">{subtitle}</p>}
      <h3 className="w-fit text-pace-black-500 text-3xl font-heading font-bold">
        {title}
      </h3>
    </div>
  );
}

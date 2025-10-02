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
      {subtitle && <h5 className="text-pace-orange-600 text-lg">{subtitle}</h5>}
      <h3 className="w-fit text-pace-black-500 text-pace-3xl font-bold">
        {title}
      </h3>
    </div>
  );
}

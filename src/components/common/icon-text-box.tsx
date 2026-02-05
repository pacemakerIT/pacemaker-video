import { LucideIcon } from 'lucide-react';

interface IconTextBoxProps {
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
}

export default function IconTextBox({
  icon: Icon,
  text,
  title,
  className = ''
}: IconTextBoxProps) {
  return (
    <div
      className={`w-full flex items-center gap-6  p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}
    >
      <div className="flex-shrink-0">
        <Icon className="w-14 h-14 " />
      </div>
      <div className="flex-1 gap-2 flex flex-col justify-start">
        <h3 className=" text-pace-xl font-semibold leading-relaxed">{title}</h3>
        <h5 className="text-pace-lg font-regular leading-relaxed">{text}</h5>
      </div>
    </div>
  );
}

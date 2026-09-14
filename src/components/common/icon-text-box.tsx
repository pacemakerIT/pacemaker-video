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
      className={`w-full flex items-start gap-6 p-8 border border-gray-200 ${className}`}
    >
      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center border-2 border-current">
        <Icon className="w-8 h-8" />
      </div>
      <div className="flex-1 gap-2 flex flex-col justify-start">
        <h3 className="text-xl font-bold leading-relaxed">{title}</h3>
        <h5 className="text-base font-normal text-gray-500 leading-relaxed">
          {text}
        </h5>
      </div>
    </div>
  );
}

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
      className={`w-full flex items-start gap-4 sm:gap-6 p-6 sm:p-8 border border-gray-200 ${className}`}
    >
      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center border-2 border-gray-300">
        <Icon className="w-8 h-8" />
      </div>
      <div className="flex-1 min-w-0 gap-1 sm:gap-2 flex flex-col justify-start">
        <h3 className="text-base sm:text-xl font-bold leading-relaxed break-words">
          {title}
        </h3>
        <h5 className="text-sm sm:text-base font-normal text-gray-500 leading-relaxed break-words">
          {text}
        </h5>
      </div>
    </div>
  );
}

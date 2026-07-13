import Image from 'next/image';
import { Star } from 'lucide-react';
import { resolveImageSrc, cn } from '@/lib/utils';

interface ReviewCardProps {
  profileImage: string;
  profileName: string;
  rating: number;
  reviewDate: string;
  reviewContent: string;
  className?: string;
}

export default function ReviewCard({
  profileImage,
  profileName,
  rating,
  reviewDate,
  reviewContent,
  className
}: ReviewCardProps) {
  const profileImageSrc =
    resolveImageSrc({ thumbnail: profileImage }) ?? '/icons/user.svg';

  return (
    <div
      className={cn(
        'w-full max-w-[1200px] border border-gray-200 p-8',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
            <Image
              src={profileImageSrc}
              width={48}
              height={48}
              alt={profileName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-[#ff4f02]">{profileName}</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 fill-current ${
                  i < rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 mt-2">{reviewDate}</span>
        </div>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">{reviewContent}</p>
    </div>
  );
}

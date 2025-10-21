import Image from 'next/image';

interface ReviewCardProps {
  profileImage: string;
  profileName: string;
  rating: number;
  reviewDate: string;
  reviewContent: string;
}

export default function ReviewCard({
  profileImage,
  profileName,
  rating,
  reviewDate,
  reviewContent
}: ReviewCardProps) {
  return (
    <div className="w-full max-w-[1200px] bg-white border border-pace-gray-100 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <Image
              src={profileImage}
              width={40}
              height={40}
              alt={profileName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium text-gray-900">{profileName}</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Image
                key={i}
                src={
                  i < rating ? '/icons/full-star.svg' : '/icons/empty-star.svg'
                }
                width={16}
                height={16}
                alt={i < rating ? 'Full star' : 'Empty star'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">{reviewDate}</span>
        </div>
      </div>
      <div className="text-gray-700 leading-relaxed">{reviewContent}</div>
    </div>
  );
}

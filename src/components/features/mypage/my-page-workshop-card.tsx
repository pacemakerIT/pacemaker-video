import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, UserRound } from 'lucide-react';
import { MyWorkshopCard } from '@/types/my-card';
import { resolveImageSrc } from '@/lib/utils';

export default function MyPageWorkshopCard({
  itemId,
  title,
  date,
  category = 'Workshop',
  location = 'Toronto',
  host = 'Pacemaker',
  image = '/img/workshop-1.png'
}: MyWorkshopCard) {
  const completed = date < new Date();
  const imageSrc = resolveImageSrc({ thumbnail: image });
  const dateLabel = date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeLabel = date.toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <Link
      href={`/workshops/${itemId}`}
      className={`group/card flex h-[340px] flex-col overflow-hidden border-t-[10px] bg-white shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${completed ? 'border-[#98A2B3]' : 'border-[#FF4F02]'}`}
    >
      <div className="relative h-full overflow-hidden">
        <Image
          src={imageSrc ?? '/img/workshop-1.png'}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className={`object-cover transition-transform duration-500 group-hover/card:scale-105 ${completed ? 'grayscale' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/75" />
        <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
          <div>
            <span
              className={`${completed ? 'bg-[#98A2B3]' : 'bg-[#FF4F02]'} mb-3 inline-block px-3 py-1 font-headline text-xs font-bold uppercase tracking-wider`}
            >
              {category}
            </span>
            <div className="flex h-14 items-start">
              <h3 className="line-clamp-2 font-headline text-xl font-bold leading-tight">
                {title}
              </h3>
            </div>
            <div className="mt-4 space-y-2 text-xs font-medium opacity-95">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date · {dateLabel} · {timeLabel}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Where · {location}
              </p>
              <p className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                Host · {host}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-4 font-headline text-sm font-bold">
            <span className={completed ? 'text-white/70' : 'text-[#FF4F02]'}>
              {completed ? 'Completed' : 'Registered'}
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors group-hover/card:text-[#00ADBD]">
              View
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

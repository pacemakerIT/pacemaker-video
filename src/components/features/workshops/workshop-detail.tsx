'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Coffee,
  Info,
  MapPin,
  ShoppingCart,
  UserRound,
  UsersRound
} from 'lucide-react';
import { ItemType } from '@prisma/client';
import { toast } from 'sonner';
import { useFavoriteContext } from '@/app/context/favorite-context';
import { useCartContext } from '@/app/context/cart-context';
import { useUserContext } from '@/app/context/user-context';
import { resolveImageSrc } from '@/lib/utils';

type Instructor = {
  id: string;
  name: string;
  description: string | null;
  profileImage: string | null;
  careers: unknown;
};

type InstructorCareer = {
  period?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
};

type Workshop = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  price: number | null;
  locationOrUrl: string | null;
  status: string;
  category: string | null;
  thumbnail: string | null;
  processContent: string | null;
  registrationCount: number;
  sections: {
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
  }[];
  instructors: Instructor[];
};

type Suggested = Pick<
  Workshop,
  | 'id'
  | 'title'
  | 'description'
  | 'startDate'
  | 'endDate'
  | 'locationOrUrl'
  | 'status'
  | 'category'
  | 'thumbnail'
> & {
  instructors: Pick<Instructor, 'name'>[];
};

const faqs = [
  {
    question: 'What should I bring?',
    answer:
      'Please bring your laptop, portfolio or resume link, and something to take notes with for feedback sessions.'
  },
  {
    question: 'Is the workshop in English?',
    answer:
      'The workshop language is chosen by the host. Industry terminology and interview practice may be covered in English.'
  },
  {
    question: 'What is the refund policy?',
    answer:
      'Please contact Pacemaker before the workshop for cancellation and refund eligibility. Limited-seat workshops may have a separate deadline.'
  }
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatCardDate(value: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
  const time = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    hour: 'numeric'
  }).format(date);

  return `${day} · ${time}`;
}

function formatCtaDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
    .format(new Date(value))
    .replace(' at ', ' · ');
}

function isOnlineWorkshop(location: string | null) {
  return /online|zoom|meet|teams|https?:\/\//i.test(location || '');
}

function isOpen(status: string) {
  return status === 'RECRUITING' || status === 'OPEN';
}

function statusLabel(status: string) {
  if (isOpen(status)) return 'Open Workshop';
  if (status === 'ONGOING') return 'Ongoing Workshop';
  if (status === 'CLOSED') return 'Closed Workshop';
  return 'Completed Workshop';
}

const WORKSHOP_CAPACITY = 15;

function registrationDeadlineLabel(startDate: string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil(
    (new Date(startDate).getTime() - Date.now()) / millisecondsPerDay
  );

  if (daysLeft < 0) return null;
  if (daysLeft === 0) return 'Registration closes today';
  if (daysLeft === 1) return 'Registration closes tomorrow';
  return `Registration closes in ${daysLeft} days`;
}

export default function WorkshopDetail({
  workshop,
  suggested
}: {
  workshop: Workshop;
  suggested: Suggested[];
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { user } = useUserContext();
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();
  const { cart, addToCart } = useCartContext();
  const liked = favorites.some(
    (item) => item.itemId === workshop.id && item.itemType === ItemType.WORKSHOP
  );
  const inCart = cart.some(
    (item) => item.itemId === workshop.id && item.itemType === ItemType.WORKSHOP
  );
  const registrationOpen = isOpen(workshop.status);
  const deadlineLabel = registrationOpen
    ? registrationDeadlineLabel(workshop.startDate)
    : null;
  const spotsLeft = Math.max(WORKSHOP_CAPACITY - workshop.registrationCount, 0);
  const [ctaTitle, ...ctaSubtitleParts] = workshop.title.split(':');
  const ctaSubtitle = ctaSubtitleParts.join(':').trim();
  const onlineWorkshop = isOnlineWorkshop(workshop.locationOrUrl);
  const imageSrc =
    resolveImageSrc({
      thumbnail: workshop.thumbnail,
      itemType: ItemType.WORKSHOP
    }) || '/img/video-bg.png';

  const toggleFavorite = () => {
    if (!user?.id) {
      toast.error('Please log in to use favorite.');
      return;
    }
    if (liked) removeFavorite(workshop.id, ItemType.WORKSHOP);
    else addFavorite(workshop.id, ItemType.WORKSHOP);
  };

  const register = () => {
    if (!registrationOpen) {
      toast.error('Registration is not available.');
      return;
    }
    if (!user?.id) {
      toast.error('Please log in to register.');
      return;
    }
    if (inCart) {
      toast.info('This workshop is already in your cart.');
      return;
    }
    addToCart(workshop.id, ItemType.WORKSHOP);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-body text-[#475467]">
      <section className="relative flex min-h-[600px] items-center overflow-hidden border-b border-gray-100 py-12 lg:h-[600px] lg:py-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-[#00263B]/75 lg:bg-gradient-to-r lg:from-[#00263B]/95 lg:via-[#00263B]/75 lg:to-[#00263B]/20" />
        <div className="relative z-10 mx-auto grid w-full max-w-[1248px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <span className="inline-flex rounded-full bg-[#00ADBD]/20 px-6 py-3 font-headline text-sm font-bold uppercase tracking-[0.2em] text-[#00ADBD]">
              {statusLabel(workshop.status)}
            </span>
            <div className="space-y-4">
              <h1 className="font-headline text-3xl font-extrabold leading-[1.3] tracking-tight text-white md:text-[40px]">
                {workshop.title}
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-gray-200 md:text-xl">
                {workshop.description ||
                  'Learn, connect, and turn your next goal into reality.'}
              </p>
            </div>
            <p className="flex items-center gap-3 font-semibold text-white">
              <Info className="h-7 w-7 text-[#FF4F02]" />
              This is a small group session with real-time feedback.
            </p>
          </div>

          <aside className="space-y-6 overflow-hidden border border-gray-100 bg-white p-6 shadow-[0_10px_30px_rgba(0,38,59,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
            <div className="space-y-3 border-b border-gray-100 pb-5">
              {deadlineLabel && (
                <span className="inline-block whitespace-nowrap rounded bg-[#FF4F02]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF4F02]">
                  {deadlineLabel}
                </span>
              )}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h2 className="font-headline text-2xl font-bold text-[#00263B]">
                  Registration
                </h2>
                <div className="shrink-0 text-left sm:text-right">
                  <strong className="font-headline text-2xl text-[#00263B] sm:block">
                    {workshop.price ? `$${workshop.price.toFixed(2)}` : 'Free'}
                  </strong>
                  <span className="ml-2 text-xs font-semibold sm:ml-0 sm:block">
                    CAD / per person
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4 text-sm font-semibold">
              <Meta icon={CalendarDays}>{formatDate(workshop.startDate)}</Meta>
              <Meta icon={MapPin}>
                {workshop.locationOrUrl || 'Location to be announced'}
              </Meta>
              <Meta icon={UsersRound}>
                Limit {WORKSHOP_CAPACITY} people · {spotsLeft} spots left
              </Meta>
              <Meta icon={Coffee}>
                Snacks, specialty coffee, and catering included
              </Meta>
            </div>
            <div className="flex gap-3 pt-4">
              <RegisterButton
                disabled={!registrationOpen}
                inCart={inCart}
                onClick={register}
              />
              <button
                onClick={toggleFavorite}
                aria-label={
                  liked ? 'Remove from favorites' : 'Add to favorites'
                }
                className={`favorite-heart flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 shadow-sm transition hover:-translate-y-1 hover:bg-orange-50 ${
                  liked ? 'favorite-heart--liked' : ''
                }`}
              >
                <span className="material-symbols-outlined text-2xl leading-none">
                  favorite
                </span>
              </button>
            </div>
            <p className="text-center text-xs font-semibold">
              * You will receive your entry ticket and directions by email right
              after payment.
            </p>
          </aside>
        </div>
      </section>

      <main className="mx-auto max-w-[1248px] space-y-20 px-6 py-16 md:py-24">
        <section className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="space-y-6 lg:col-span-2">
            <SectionHeading eyebrow="About" title="How the Workshop Works" />
            <p className="whitespace-pre-line text-lg font-medium leading-relaxed">
              {workshop.processContent ||
                workshop.description ||
                'Detailed workshop information will be available soon.'}
            </p>
          </div>
          <div className="space-y-8">
            <h2 className="font-headline text-2xl font-extrabold text-[#00263B]">
              FAQ
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="overflow-hidden border border-gray-100 bg-white shadow-[0_10px_30px_rgba(0,38,59,0.05)]"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-headline font-bold text-[#00263B] hover:bg-gray-50"
                    aria-expanded={openFaq === index}
                  >
                    {faq.question}
                    <ChevronDown
                      className={`h-5 w-5 transition ${openFaq === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <p className="border-t border-gray-100 bg-gray-50/50 p-5 text-sm font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {workshop.sections.length > 0 && (
          <section className="space-y-8 border-t border-gray-100 pt-12">
            <SectionHeading eyebrow="Timeline" title="Curriculum Details" />
            <div className="space-y-6">
              {workshop.sections.map((section, index) => (
                <article
                  key={section.id}
                  className="space-y-3 rounded-none border border-gray-100 bg-white p-8 shadow-[0_10px_30px_rgba(0,38,59,0.05)] transition-[transform,box-shadow] duration-300 hover:-translate-y-[10px] hover:shadow-[0_20px_40px_rgba(0,38,59,0.12)]"
                >
                  <span className="font-headline text-xs font-bold uppercase tracking-[0.18em] text-[#FF4F02]">
                    Session {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-headline text-lg font-bold text-[#00263B]">
                    {section.title}
                  </h3>
                  <p className="whitespace-pre-line text-sm font-medium leading-relaxed">
                    {section.description || 'Session details coming soon.'}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {workshop.instructors.length > 0 && (
          <section className="border-t border-gray-100 pt-20">
            <h2 className="mb-12 font-headline text-3xl font-bold text-[#00263B]">
              Instructor Profile
            </h2>

            <InstructorCarousel instructors={workshop.instructors} />
          </section>
        )}

        {suggested.length > 0 && (
          <section className="space-y-8 border-t border-gray-100 pt-20">
            <h2 className="font-headline text-3xl font-extrabold text-[#00263B]">
              You May Also Like
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {suggested.map((item) => (
                <SuggestedCard key={item.id} workshop={item} />
              ))}
            </div>
          </section>
        )}

        <section
          id="apply"
          className="scroll-mt-32 border-t border-gray-100 pt-20"
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="relative w-full overflow-hidden border border-gray-100 bg-[#00263B] p-10 text-center text-white shadow-[0_10px_30px_rgba(0,38,59,0.08)] md:p-14">
              <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-[#00ADBD]/10" />

              <div className="relative z-10">
                <h2 className="mb-6 font-headline text-3xl font-extrabold italic leading-tight text-white md:text-4xl">
                  Join {ctaTitle.trim()}
                  {ctaSubtitle && (
                    <>
                      :<br className="hidden md:inline" />
                      <span className="text-[#FF4F02]">{ctaSubtitle}</span>
                    </>
                  )}
                </h2>

                <p className="mx-auto mb-4 max-w-lg text-sm font-bold uppercase tracking-[0.2em] text-white/70 md:text-base">
                  {formatCtaDate(workshop.startDate)}
                </p>

                <div className="mb-6 inline-block border border-white/10 bg-[#00263B]/40 p-6 backdrop-blur-sm md:p-8">
                  <p className="font-headline text-5xl font-bold tracking-tight text-[#00ADBD] md:text-6xl">
                    {workshop.price ? `$${workshop.price}` : 'Free'}
                    <span className="ml-2 text-xl font-normal italic text-white/50">
                      CAD
                    </span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-white/70 md:text-sm">
                    Admission fee ·{' '}
                    {onlineWorkshop
                      ? 'Online workshop & live Q&A'
                      : 'Offline seminar & live Q&A'}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    disabled={!registrationOpen}
                    onClick={register}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#FF4F02] px-12 py-5 font-headline text-xl font-extrabold text-white shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-transform hover:scale-[1.02] hover:bg-[#E04400] disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {inCart
                      ? 'In cart'
                      : registrationOpen
                        ? 'Register now'
                        : 'Registration closed'}
                  </button>
                </div>

                <p className="mt-4 text-xs font-semibold text-white/50">
                  {workshop.locationOrUrl || 'Location to be announced'}
                  {workshop.locationOrUrl &&
                    ` (${onlineWorkshop ? 'Online Event' : 'Offline Event'})`}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-gray-100 bg-white p-4 shadow-lg md:hidden">
        <div className="min-w-0 flex-1 pr-4">
          <p className="truncate text-xs font-bold text-[#475467]">
            {workshop.title}
          </p>
          <p className="mt-1 whitespace-nowrap font-headline text-lg font-extrabold leading-none text-[#00263B]">
            {workshop.price ? `$${workshop.price.toFixed(2)}` : 'Free'}
            {workshop.price != null && workshop.price > 0 && (
              <span className="ml-1 text-xs font-normal text-[#475467]">
                CAD
              </span>
            )}
          </p>
        </div>
        <button
          disabled={!registrationOpen}
          onClick={register}
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#FF4F02] px-6 py-3 font-bold text-white disabled:bg-gray-400"
        >
          <ShoppingCart className="h-4 w-4" />
          {inCart ? 'In cart' : 'Register'}
        </button>
      </div>
    </div>
  );
}

function InstructorCarousel({ instructors }: { instructors: Instructor[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);

  const finishDrag = () => {
    if (!isDragging) return;

    if (dragOffset < -50 && activeIndex < instructors.length - 1) {
      setActiveIndex((index) => index + 1);
    } else if (dragOffset > 50 && activeIndex > 0) {
      setActiveIndex((index) => index - 1);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <div>
      <div className="relative w-full overflow-hidden">
        <div
          className={`flex touch-pan-y ease-in-out ${isDragging ? 'cursor-grabbing' : 'cursor-grab transition-transform duration-500'}`}
          style={{
            transform: `translateX(calc(${-activeIndex * 100}% + ${dragOffset}px))`
          }}
          onPointerDown={(event) => {
            dragStart.current = event.clientX;
            setIsDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (isDragging) setDragOffset(event.clientX - dragStart.current);
          }}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          {instructors.map((instructor) => (
            <div key={instructor.id} className="w-full shrink-0">
              <InstructorSlide instructor={instructor} />
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-16 flex justify-center gap-3"
        aria-label="Choose instructor"
      >
        {instructors.map((instructor, index) => (
          <button
            key={instructor.id}
            type="button"
            aria-label={`Show ${instructor.name}`}
            aria-current={activeIndex === index}
            onClick={() => {
              setActiveIndex(index);
              setDragOffset(0);
            }}
            className={`h-[18px] min-h-0 w-[18px] min-w-0 rounded-full transition-colors duration-300 ${
              activeIndex === index
                ? 'bg-[#FF4F02]'
                : 'bg-[#CCCCCC] hover:bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function InstructorSlide({ instructor }: { instructor: Instructor }) {
  const careers = parseCareers(instructor.careers);
  const profileImage = instructor.profileImage
    ? resolveImageSrc({ imageUrl: instructor.profileImage })
    : null;

  return (
    <article className="flex flex-col gap-16 px-1 lg:flex-row lg:justify-between">
      <div className="w-full lg:w-[680px]">
        <h3 className="mb-4 font-headline text-2xl font-bold text-[#00263B]">
          {instructor.name}
        </h3>
        <p className="mb-8 whitespace-pre-line leading-relaxed text-[#475467]">
          {instructor.description || 'Instructor profile coming soon.'}
        </p>

        {careers.length > 0 && (
          <div>
            <h4 className="mb-4 font-bold text-[#00263B]">Experience</h4>
            <ul className="space-y-4 text-sm">
              {careers.map((career, index) => (
                <li
                  key={`${career.period}-${career.position}-${index}`}
                  className="flex gap-8"
                >
                  <span className="w-24 shrink-0 text-[#475467]/60">
                    {career.period}
                  </span>
                  <span className="text-[#00263B]">{career.position}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col lg:w-[480px]">
        <div className="relative flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-none border border-gray-100 bg-white shadow-[0_10px_30px_rgba(0,38,59,0.05)]">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={`${instructor.name} profile`}
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
              draggable={false}
            />
          ) : (
            <UserRound className="h-24 w-24 text-gray-300" />
          )}
        </div>
      </div>
    </article>
  );
}

function parseCareers(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): { period: string; position: string }[] => {
    if (!item || typeof item !== 'object') return [];

    const career = item as InstructorCareer;
    const position = career.position || career.description;
    if (!position) return [];

    if (career.period) {
      return [{ period: career.period, position }];
    }

    const start = formatCareerDate(career.startDate);
    const end = career.isCurrent ? '' : formatCareerDate(career.endDate);
    const period = start
      ? `${start} ~${end ? ` ${end}` : ''}`
      : end || 'Present';

    return [{ period, position }];
  });
}

function formatCareerDate(value?: string) {
  if (!value) return '';
  const match = value.match(/^\d{4}/);
  return match?.[0] || value;
}

function Meta({
  icon: Icon,
  children
}: {
  icon: typeof CalendarDays;
  children: React.ReactNode;
}) {
  return (
    <p className="flex gap-3">
      <Icon className="h-5 w-5 shrink-0 text-[#FF4F02]" />
      <span>{children}</span>
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <span className="mb-5 inline-block rounded-full bg-[#00ADBD]/10 px-5 py-2 font-headline text-xs font-bold uppercase tracking-[0.18em] text-[#00ADBD]">
        {eyebrow}
      </span>
      <h2 className="font-headline text-3xl font-bold text-[#00263B]">
        {title}
      </h2>
    </div>
  );
}

function RegisterButton({
  disabled,
  inCart,
  onClick,
  large = false
}: {
  disabled: boolean;
  inCart: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF4F02] font-headline font-bold text-white shadow-lg transition hover:bg-[#E04400] disabled:cursor-not-allowed disabled:bg-gray-400 ${large ? 'px-12 py-5 text-xl' : 'min-h-12 flex-1 px-4 py-3'}`}
    >
      {inCart ? 'In cart' : disabled ? 'Registration closed' : 'Register now'}
      <ArrowRight className="h-5 w-5" />
    </button>
  );
}

function SuggestedCard({ workshop }: { workshop: Suggested }) {
  const { user } = useUserContext();
  const { favorites, addFavorite, removeFavorite } = useFavoriteContext();
  const liked = favorites.some(
    (item) => item.itemId === workshop.id && item.itemType === ItemType.WORKSHOP
  );
  const src =
    resolveImageSrc({
      thumbnail: workshop.thumbnail,
      itemType: ItemType.WORKSHOP
    }) || '/icons/workshop-card.svg';
  const state = getSuggestedState(workshop);

  const toggleFavorite = () => {
    if (!user?.id) {
      toast.error('Please log in to use favorite.');
      return;
    }

    if (liked) removeFavorite(workshop.id, ItemType.WORKSHOP);
    else addFavorite(workshop.id, ItemType.WORKSHOP);
  };

  return (
    <article className="group/card flex flex-col gap-5">
      <div
        className={`relative h-96 overflow-hidden border-t-[10px] bg-white shadow-[0_10px_30px_rgba(0,38,59,0.05)] transition-shadow duration-500 group-hover/card:shadow-[0_28px_56px_rgba(0,38,59,0.13)] ${state.cardClass}`}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />

        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
          className={`favorite-heart absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-500 ease-out hover:scale-110 ${
            liked ? 'favorite-heart--liked' : ''
          }`}
        >
          <span className="material-symbols-outlined text-xl leading-none">
            favorite
          </span>
        </button>

        <Link
          href={`/workshops/${workshop.id}`}
          className="absolute inset-0 z-10 flex flex-col justify-between p-5 text-white md:p-6"
        >
          <div className="pr-12">
            <span className="mb-3 inline-block bg-[#FF4F02] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {formatCategory(workshop.category)}
            </span>
            <h3 className="font-headline text-xl font-bold leading-snug text-white md:text-2xl">
              {workshop.title}
            </h3>

            <div className="mt-4 space-y-2 text-[0.8rem] font-medium text-white/90 md:text-[0.85rem]">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0" />
                Date · {formatCardDate(workshop.startDate)}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                Where · {workshop.locationOrUrl || 'To be announced'}
              </p>
              {workshop.instructors.length > 0 && (
                <p className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 shrink-0" />
                  Host ·{' '}
                  {workshop.instructors.map(({ name }) => name).join(', ')}
                </p>
              )}
              {workshop.description && (
                <p className="line-clamp-2 pt-1 text-[0.78rem] font-medium italic text-white/85 md:text-[0.82rem]">
                  “{workshop.description}”
                </p>
              )}
            </div>
          </div>

          <span className="flex items-center gap-2 font-bold transition-transform duration-300 group-hover/card:translate-x-2">
            Sign up
            <ArrowRight className="h-5 w-5" />
          </span>
        </Link>
      </div>
      <p
        className={`text-center text-[1.05rem] font-bold tracking-wide ${state.labelClass}`}
      >
        {state.label}
      </p>
    </article>
  );
}

function formatCategory(category: string | null) {
  if (!category) return 'Workshop';
  return category.replaceAll('_', ' ');
}

function getSuggestedState(workshop: Suggested) {
  const now = Date.now();
  const startsAt = new Date(workshop.startDate).getTime();
  const endsAt = new Date(workshop.endDate).getTime();

  if (startsAt <= now && endsAt >= now) {
    return {
      label: 'Live now',
      cardClass: 'border-[#FF4F02]',
      labelClass: 'text-[#FF4F02]'
    };
  }

  if (endsAt < now || workshop.status === 'COMPLETED') {
    return {
      label: 'Ended',
      cardClass: 'border-slate-400 opacity-85 saturate-50',
      labelClass: 'text-slate-400'
    };
  }

  return {
    label: 'Coming soon',
    cardClass: 'border-[#00263B]',
    labelClass: 'text-[#00263B]'
  };
}

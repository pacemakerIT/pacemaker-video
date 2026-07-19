'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Heart,
  Info,
  MapPin,
  ShoppingCart,
  UserRound
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
  | 'locationOrUrl'
  | 'status'
  | 'category'
  | 'thumbnail'
>;

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

function isOpen(status: string) {
  return status === 'RECRUITING' || status === 'OPEN';
}

function statusLabel(status: string) {
  if (isOpen(status)) return 'Open Workshop';
  if (status === 'ONGOING') return 'Ongoing Workshop';
  if (status === 'CLOSED') return 'Closed Workshop';
  return 'Completed Workshop';
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

          <aside className="space-y-6 border border-gray-100 bg-white p-6 shadow-[0_10px_30px_rgba(0,38,59,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
            <div className="flex items-end justify-between gap-4 border-b border-gray-100 pb-5">
              <h2 className="font-headline text-2xl font-bold text-[#00263B]">
                Registration
              </h2>
              <div className="text-right">
                <strong className="block font-headline text-2xl text-[#00263B]">
                  {workshop.price ? `$${workshop.price.toFixed(2)}` : 'Free'}
                </strong>
                <span className="text-xs font-semibold">CAD / per person</span>
              </div>
            </div>
            <div className="space-y-4 text-sm font-semibold">
              <Meta icon={CalendarDays}>{formatDate(workshop.startDate)}</Meta>
              <Meta icon={Clock3}>Ends {formatDate(workshop.endDate)}</Meta>
              <Meta icon={MapPin}>
                {workshop.locationOrUrl || 'Location to be announced'}
              </Meta>
              {workshop.instructors.length > 0 && (
                <Meta icon={UserRound}>
                  Hosted by{' '}
                  {workshop.instructors.map(({ name }) => name).join(', ')}
                </Meta>
              )}
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
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 shadow-sm transition hover:-translate-y-1 hover:bg-orange-50"
              >
                <Heart
                  className={`h-6 w-6 ${liked ? 'fill-[#FF4F02] text-[#FF4F02]' : 'text-gray-400'}`}
                />
              </button>
            </div>
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

        <section id="apply" className="border-t border-gray-100 pt-20">
          <div className="overflow-hidden bg-[#00263B] p-10 text-center text-white shadow-[0_10px_30px_rgba(0,38,59,0.08)] md:p-14">
            <h2 className="mb-5 font-headline text-3xl font-extrabold italic text-white md:text-4xl">
              Join {workshop.title}
            </h2>
            <p className="mb-6 font-bold uppercase tracking-[0.16em] text-white/70">
              {formatDate(workshop.startDate)}
            </p>
            <p className="mb-7 font-headline text-5xl font-bold text-[#00ADBD]">
              {workshop.price ? `$${workshop.price}` : 'Free'}{' '}
              <span className="text-lg font-normal text-white/50">CAD</span>
            </p>
            <RegisterButton
              disabled={!registrationOpen}
              inCart={inCart}
              onClick={register}
              large
            />
            <p className="mt-4 text-xs text-white/50">
              {workshop.locationOrUrl || 'Location to be announced'}
            </p>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-gray-100 bg-white p-4 shadow-lg md:hidden">
        <div>
          <p className="max-w-[180px] truncate text-xs font-bold">
            {workshop.title}
          </p>
          <strong className="text-lg text-[#00263B]">
            {workshop.price ? `$${workshop.price}` : 'Free'}
          </strong>
        </div>
        <button
          disabled={!registrationOpen}
          onClick={register}
          className="flex items-center gap-2 rounded-2xl bg-[#FF4F02] px-6 py-3 font-bold text-white disabled:bg-gray-400"
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
  const src =
    resolveImageSrc({
      thumbnail: workshop.thumbnail,
      itemType: ItemType.WORKSHOP
    }) || '/icons/workshop-card.svg';
  return (
    <Link
      href={`/workshops/${workshop.id}`}
      className="group block border-t-[10px] border-[#FF4F02] bg-white shadow-[0_10px_30px_rgba(0,38,59,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-72 overflow-hidden">
        <Image
          src={src}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
          <span className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-300">
            {workshop.category || 'Workshop'}
          </span>
          <h3 className="font-headline text-xl font-bold text-white">
            {workshop.title}
          </h3>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4" />
            {formatDate(workshop.startDate)}
          </p>
        </div>
      </div>
    </Link>
  );
}

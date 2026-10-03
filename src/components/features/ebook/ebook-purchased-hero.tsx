'use client';
import { Button } from '@/components/ui/button';

interface EbookPurchasedHeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  onContinueReading?: () => void;
  /** Reading progress as a percentage (0-100). */
  progressPercent?: number;
  currentPage?: number;
  totalPages?: number;
}

export default function EbookPurchasedHero({
  title,
  subtitle,
  ctaText = 'Continue reading',
  onContinueReading,
  // TODO: wire these to real reading-progress data once available.
  progressPercent = 0,
  currentPage = 0,
  totalPages = 0
}: EbookPurchasedHeroProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));
  const pagesRemaining = Math.max(0, totalPages - currentPage);

  return (
    <section className="relative w-full overflow-hidden bg-[#EBF5FF] py-12 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        {/* Title & Action */}
        <div className="max-w-3xl">
          <h1 className="mb-4 whitespace-pre-line font-heading text-3xl font-bold leading-[1.35] tracking-tight text-[#00263b] sm:text-4xl md:text-[40px] lg:text-[44px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-8 font-body text-base font-medium leading-relaxed text-[#475467] sm:text-lg md:text-xl">
              {subtitle}
            </p>
          )}

          <div className="mb-10">
            <Button
              type="button"
              onClick={onContinueReading}
              className="inline-flex h-auto items-center justify-center whitespace-nowrap rounded-2xl bg-[#ff4f02] px-6 py-3.5 font-heading text-sm font-bold text-white shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all hover:scale-[1.02] hover:bg-[#e04400] active:scale-[0.98] sm:px-8 sm:py-4 sm:text-base md:text-lg"
            >
              {ctaText}
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="w-full rounded-xl border border-gray-100/80 bg-white p-5 shadow-[0_10px_30px_rgba(0,38,59,0.08)] sm:rounded-2xl sm:p-6">
          <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB] sm:h-3">
            <div
              className="h-full rounded-full bg-[#ff4f02] transition-all duration-500"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-[#475467] sm:text-sm">
            <span className="font-bold text-[#00263b]">
              {clampedProgress}% Complete
            </span>
            <span className="text-gray-400">
              {pagesRemaining}/{totalPages} Pages remaining
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

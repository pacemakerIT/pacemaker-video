'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel';

interface ListHeaderProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  route?: string;
  height?: string;
  gradientColors?: {
    start: string;
    middle: string;
    end: string;
  };
  slides?: {
    title: string;
    subtitle?: string;
    buttonText?: string;
    route?: string;
  }[];
  autoPlayInterval?: number;
  interval?: number;
  showHeroAnimations?: boolean;
}

const CTA_BASE =
  'inline-flex items-center justify-center gap-2 bg-[#FF4F02] hover:bg-[#E04400] text-white font-bold text-lg font-headline px-8 py-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all duration-500 ease-out hover:scale-[1.02]';

export default function ListHeader({
  title,
  buttonText,
  route,
  height = 'h-96',
  gradientColors = {
    start: '#A8DBFF60',
    middle: '#FF823610',
    end: '#A8DBFF40'
  },
  slides = title && buttonText ? [{ title, buttonText, route }] : [],
  autoPlayInterval,
  showHeroAnimations = false
}: ListHeaderProps) {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const handleCtaClick = (targetRoute?: string) => {
    if (!targetRoute) return;
    if (targetRoute.startsWith('#')) {
      document
        .getElementById(targetRoute.slice(1))
        ?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    router.push(targetRoute);
  };

  // Hash routes render as an anchor like the design sample; regular routes
  // stay a button that navigates via the router.
  const renderCta = (
    text: string,
    targetRoute: string | undefined,
    className: string
  ) => {
    if (targetRoute?.startsWith('#')) {
      return (
        <a
          href={targetRoute}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            handleCtaClick(targetRoute);
          }}
        >
          {text}
        </a>
      );
    }
    return (
      <button className={className} onClick={() => handleCtaClick(targetRoute)}>
        {text}
      </button>
    );
  };

  const heroBackground = showHeroAnimations
    ? 'linear-gradient(180deg, #e6f0f8 0%, #ffffff 100%)'
    : `linear-gradient(30deg, ${gradientColors.start} 5%, ${gradientColors.middle} 40%, ${gradientColors.end} 50%)`;

  useEffect(() => {
    if (!api) return;
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });

    let timer: NodeJS.Timeout;
    if (autoPlayInterval && slides.length > 1) {
      timer = setInterval(() => {
        api?.scrollNext();
      }, autoPlayInterval);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [api, autoPlayInterval, slides.length]);

  if (slides.length === 0) {
    return (
      <div
        data-testid="list-header"
        className={`w-full flex flex-col justify-center items-center ${height} relative overflow-hidden`}
        style={{ background: heroBackground }}
      >
        {showHeroAnimations && (
          <>
            <div className="hero-dust-overlay" aria-hidden="true" />
            <div className="hero-orb hero-orb--teal" aria-hidden="true" />
            <div className="hero-orb hero-orb--orange" aria-hidden="true" />
          </>
        )}
        <div
          className={`relative z-10 flex flex-col justify-center items-center${showHeroAnimations ? '' : ' gap-8'}`}
        >
          {showHeroAnimations && (
            <p className="text-[#FF4F02] font-bold font-body text-base uppercase tracking-[0.16em] mb-2">
              WITH PACEMAKER
            </p>
          )}
          <span
            className={`font-extrabold text-pace-4xl text-center whitespace-pre-line text-[#00263B] leading-tight${showHeroAnimations ? ' font-headline mb-8' : ''}`}
          >
            {title}
          </span>
          {buttonText &&
            renderCta(
              buttonText,
              route,
              showHeroAnimations
                ? `${CTA_BASE} hero-cta-bob`
                : 'inline-flex items-center justify-center gap-2 bg-pace-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full'
            )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="list-header"
      className={`w-full flex flex-col justify-center items-center ${height} relative overflow-hidden`}
      style={{ background: heroBackground }}
    >
      {showHeroAnimations && (
        <>
          <div className="hero-dust-overlay" aria-hidden="true" />
          <div className="hero-orb hero-orb--teal" aria-hidden="true" />
          <div className="hero-orb hero-orb--orange" aria-hidden="true" />
        </>
      )}
      <Carousel
        setApi={setApi}
        className="w-screen h-full flex items-center justify-center relative z-10"
        opts={{ align: 'center', loop: true }}
      >
        <CarouselContent className="w-screen h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="w-screen h-full">
              <div
                className={`flex flex-col justify-center items-center h-full${showHeroAnimations ? '' : ' gap-8'}`}
              >
                {showHeroAnimations && (
                  <p className="text-[#FF4F02] font-bold font-body text-base uppercase tracking-[0.16em] mb-2">
                    WITH PACEMAKER
                  </p>
                )}
                <div
                  className={`flex flex-col justify-center items-center${showHeroAnimations ? '' : ' gap-4 h-full'}`}
                >
                  <span
                    className={`font-extrabold text-pace-4xl text-center whitespace-pre-line pointer-events-none cursor-default select-none text-[#00263B] leading-tight${showHeroAnimations ? ' font-headline mb-8' : ''}`}
                  >
                    {slide.title}
                  </span>
                  {slide.subtitle && (
                    <span className="font-medium text-pace-xl text-center whitespace-pre-line pointer-events-none cursor-default select-none">
                      {slide.subtitle}
                    </span>
                  )}
                </div>
                {slide.buttonText &&
                  renderCta(
                    slide.buttonText,
                    slide.route,
                    showHeroAnimations
                      ? `${CTA_BASE} hero-cta-bob`
                      : 'inline-flex items-center justify-center gap-2 bg-pace-orange-600 text-white font-bold text-lg px-10 py-6 rounded-full'
                  )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                current === index
                  ? 'bg-pace-orange-600 shadow-[0_4px_4px_rgba(0,0,0,0.25)]'
                  : 'bg-white hover:bg-pace-orange-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel';

interface SlideData {
  tag: string;
  tagColor: string;
  title: string;
  highlight: string;
  highlightColor: string;
  titleSuffix?: string;
  description: string;
  buttonText?: string;
  link?: string;
  titleSizeClass?: string;
}

const DEFAULT_SLIDES: SlideData[] = [
  {
    tag: 'Pacemaker Career Services',
    tagColor: 'rgba(0, 173, 189, 0.85)',
    title: 'Not sure where to start\nyour job search? Our ',
    highlight: 'Expertise',
    highlightColor: 'text-teal',
    description: 'Help with skills, your resume, and interviews.',
    buttonText: 'Browse courses',
    link: '/courses'
  },
  {
    tag: 'Tailored For You',
    tagColor: 'rgba(255, 79, 2, 0.85)',
    title: 'Get your ',
    highlight: 'resume',
    highlightColor: 'text-orange',
    titleSuffix: '\nreviewed by pros',
    description: 'A clear resume that helps you land more interviews.',
    buttonText: 'Get Started',
    link: '/courses'
  },
  {
    tag: 'Real Experience',
    tagColor: 'rgba(0, 173, 189, 0.85)',
    title: '',
    highlight: 'Mock interviews',
    highlightColor: 'text-teal',
    titleSuffix: '\nwith local mentors',
    description: 'Honest feedback from people who hire in North America.',
    buttonText: 'Join Workshop',
    link: '/workshops'
  }
];

const HERO_TILE_IMAGES = [
  '5g7a6941.webp',
  '5g7a6962.webp',
  '5g7a7008.webp',
  '5g7a7128.webp',
  '5g7a7260.webp',
  '5g7a7315.webp',
  '5g7a7321.webp',
  '5g7a7379.webp',
  '5g7a7416.webp',
  '5g7a7425.webp',
  '5g7a7467.webp',
  '5g7a7482.webp',
  '5g7a7515.webp',
  '5g7a7523.webp',
  '5g7a7524.webp',
  '5g7a7528.webp',
  '5g7a7536.webp',
  '5g7a7537.webp',
  '5g7a7538.webp',
  '5g7a7552.webp',
  '5g7a7581.webp',
  '5g7a7586.webp'
];

const HERO_TILE_REPEATS = 4;

interface ListHeaderProps {
  slides?: SlideData[];
  autoPlayInterval?: number;
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
    <section
      className={`relative isolate h-[520px] overflow-hidden bg-navy px-6 pb-[46px] pt-[70px]`}
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
              className={`transition-all duration-300 rounded-full ${
                current === index
                  ? 'w-7 h-2'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              style={
                current === index ? { background: slide.tagColor } : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

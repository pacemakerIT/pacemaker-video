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
}

export default function ListHeader({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5000,
  gradientColors
}: ListHeaderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
  }, [api, onSelect]);

  useEffect(() => {
    if (!api || autoPlayInterval <= 0 || slides.length <= 1) return;

    const intervalId = window.setInterval(() => {
      api.scrollNext();
    }, autoPlayInterval);

    return () => window.clearInterval(intervalId);
  }, [api, autoPlayInterval, slides.length]);

  return (
    <section
      className={`relative isolate h-[520px] overflow-hidden bg-navy px-6 pb-[46px] pt-[70px]`}
      data-testid="list-header"
      style={
        gradientColors
          ? {
              backgroundImage: `linear-gradient(135deg, ${gradientColors.start}, ${gradientColors.middle}, ${gradientColors.end})`
            }
          : undefined
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-10%] z-0 grid auto-rows-[90px] grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 bg-navy opacity-60 [filter:grayscale(0.08)_brightness(0.42)_contrast(1.14)_saturate(0.88)] motion-safe:animate-services-hero-photo-pan will-change-transform"
      >
        {Array.from({ length: HERO_TILE_REPEATS }).flatMap((_, repeatIndex) =>
          HERO_TILE_IMAGES.map((image) => (
            <div
              key={`${repeatIndex}-${image}`}
              className="border border-[rgba(255,255,255,0.06)] bg-cover bg-center [&:nth-child(4n)]:bg-top [&:nth-child(5n)]:bg-[position:60%_center]"
              style={{
                backgroundImage: `url('/img/services-hero-tiles/${image}')`
              }}
            />
          ))
        )}
      </div>

      {/* Animated Gradient Overlays */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] [background-image:radial-gradient(circle_at_14%_18%,rgb(0_173_189_/_0.3)_0%,rgb(0_173_189_/_0)_44%),radial-gradient(circle_at_84%_14%,rgb(255_79_2_/_0.24)_0%,rgb(255_79_2_/_0)_48%),linear-gradient(135deg,rgb(0_38_59_/_0.96)_0%,rgb(0_38_59_/_0.92)_42%,rgb(0_173_189_/_0.18)_50%,rgb(255_79_2_/_0.15)_58%,rgb(0_38_59_/_0.95)_100%)] [background-position:0%_0%,100%_0%,0%_50%] [background-size:180%_180%,220%_220%,280%_280%] before:absolute before:right-[-8%] before:top-[-40%] before:h-[640px] before:w-[640px] before:rounded-full before:bg-[radial-gradient(circle,rgb(0_173_189_/_0.3)_0%,transparent_68%)] before:content-[''] before:[filter:blur(4px)] after:absolute after:bottom-[-25%] after:left-[-4%] after:h-[420px] after:w-[420px] after:rounded-full after:bg-[radial-gradient(circle,rgb(255_79_2_/_0.24)_0%,transparent_65%)] after:content-[''] after:[filter:blur(3px)] motion-safe:animate-services-hero-gradient-flow motion-safe:before:animate-services-hero-glow-drift motion-safe:after:animate-services-hero-glow-drift-reverse will-change-[background-position]"
      />

      <div className="relative z-[2] mx-auto w-full max-w-[740px] px-6">
        <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="flex h-[240px] flex-col items-center justify-center overflow-hidden text-center transition-all duration-700">
                  <p
                    className="mb-4 text-[0.82rem] font-bold uppercase tracking-[0.2em] md:text-[0.9rem]"
                    style={{ color: slide.tagColor }}
                  >
                    {slide.tag}
                  </p>
                  <div className="mb-6 flex w-full items-center justify-center">
                    <h1
                      className={`w-full font-extrabold leading-[1.1] tracking-tight text-white whitespace-pre-wrap ${slide.titleSizeClass || 'text-[clamp(2rem,4.5vw,2.8rem)]'}`}
                    >
                      {slide.title}
                      <em className={`not-italic ${slide.highlightColor}`}>
                        {slide.highlight}
                      </em>
                      {slide.titleSuffix}
                    </h1>
                  </div>
                  <p className="mx-auto mb-0 max-w-[560px] text-[1rem] md:text-[1.125rem] leading-[1.55] text-white/55 whitespace-pre-wrap">
                    {slide.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Floating CTA Button */}
        <div className="mt-8 flex justify-center animate-services-hero-scroll-float">
          {slides[current].link && slides[current].buttonText && (
            <Link href={slides[current].link!}>
              <Button className="inline-flex h-auto items-center justify-center gap-2 bg-orange px-8 py-4 font-headline text-lg font-bold text-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-orange-hover">
                {slides[current].buttonText}
              </Button>
            </Link>
          )}
        </div>

        {/* Pagination Dots */}
        <div className="mt-10 flex h-4 items-center justify-center gap-4">
          {slides.map((slide, index) => (
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

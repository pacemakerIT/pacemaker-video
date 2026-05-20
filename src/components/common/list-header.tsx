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
import Autoplay from 'embla-carousel-autoplay';

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

  return (
    <section
      className={`relative isolate overflow-hidden bg-navy px-6 py-6`}
      data-testid="list-header"
      style={
        gradientColors
          ? {
              backgroundImage: `linear-gradient(135deg, ${gradientColors.start}, ${gradientColors.middle}, ${gradientColors.end})`
            }
          : undefined
      }
    >
      {/* Animated Gradient Overlays */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] [background-image:radial-gradient(circle_at_14%_18%,rgb(0_173_189_/_0.3)_0%,rgb(0_173_189_/_0)_44%),radial-gradient(circle_at_84%_14%,rgb(255_79_2_/_0.24)_0%,rgb(255_79_2_/_0)_48%),linear-gradient(135deg,rgb(0_38_59_/_0.96)_0%,rgb(0_38_59_/_0.92)_42%,rgb(0_173_189_/_0.18)_50%,rgb(255_79_2_/_0.15)_58%,rgb(0_38_59_/_0.95)_100%)] [background-position:0%_0%,100%_0%,0%_50%] [background-size:180%_180%,220%_220%,280%_280%] before:absolute before:right-[-8%] before:top-[-40%] before:h-[640px] before:w-[640px] before:rounded-full before:bg-[radial-gradient(circle,rgb(0_173_189_/_0.3)_0%,transparent_68%)] before:content-[''] before:[filter:blur(4px)] after:absolute after:bottom-[-25%] after:left-[-4%] after:h-[420px] after:w-[420px] after:rounded-full after:bg-[radial-gradient(circle,rgb(255_79_2_/_0.24)_0%,transparent_65%)] after:content-[''] after:[filter:blur(3px)] animate-services-hero-gradient-flow before:animate-services-hero-glow-drift after:animate-services-hero-glow-drift-reverse will-change-[background-position]"
      />

      <div className="relative z-[2] mx-auto w-full max-w-[840px]">
        <Carousel
          setApi={setApi}
          plugins={[Autoplay({ delay: autoPlayInterval })]}
          className="w-full"
          opts={{ loop: true }}
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="text-center px-4 transition-all duration-700 min-h-[220px] md:min-h-[260px] flex flex-col justify-start items-center pt-8">
                  <p
                    className="mb-4 text-[0.82rem] font-bold uppercase tracking-[0.2em] md:text-[0.9rem]"
                    style={{ color: slide.tagColor }}
                  >
                    {slide.tag}
                  </p>
                  <div className="flex items-center justify-center min-h-[100px] md:min-h-[140px] mb-6 w-full">
                    <h1
                      className={`font-extrabold leading-[1.15] tracking-tight text-white whitespace-pre-wrap ${slide.titleSizeClass || 'text-[clamp(1.8rem,4.5vw,3rem)]'}`}
                    >
                      {slide.title}
                      <em className={`not-italic ${slide.highlightColor}`}>
                        {slide.highlight}
                      </em>
                      {slide.titleSuffix}
                    </h1>
                  </div>
                  <p className="mx-auto mb-0  text-[1rem] md:text-[1.125rem] leading-[1.6] text-white/60 font-medium whitespace-pre-wrap">
                    {slide.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Floating CTA Button */}
        <div className="mt-10 flex justify-center animate-services-hero-scroll-float min-h-[84px]">
          {slides[current].link && slides[current].buttonText && (
            <Link href={slides[current].link!}>
              <Button className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange-hover text-white font-bold text-lg px-10 py-7 rounded-2xl shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)] transition-all duration-500 ease-out hover:scale-[1.05]">
                {slides[current].buttonText}
              </Button>
            </Link>
          )}
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center mt-12 gap-4 h-4">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`transition-all duration-300 rounded-full ${
                current === index
                  ? 'w-8 h-2'
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

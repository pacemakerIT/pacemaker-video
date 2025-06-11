'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
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
  height?: string;
  gradientColors?: {
    start: string;
    middle: string;
    end: string;
  };
  slides?: { title: string; subtitle?: string; buttonText?: string }[];
  autoPlayInterval?: number;
  interval?: number;
}

export default function ListHeader({
  title,
  buttonText,
  height = 'h-96',
  gradientColors = {
    start: '#A8DBFF60',
    middle: '#FF823610',
    end: '#A8DBFF40'
  },
  slides = title && buttonText ? [{ title, buttonText }] : [],
  autoPlayInterval
}: ListHeaderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [api, autoPlayInterval, slides.length]);

  // slides가 비어있으면 빈 div 반환
  if (slides.length === 0) {
    return (
      <div
        data-testid="list-header"
        className={`w-full flex flex-col justify-center items-center ${height} relative`}
        style={{
          background: `linear-gradient(30deg, ${gradientColors.start} 5%, ${gradientColors.middle} 40%, ${gradientColors.end} 50%)`
        }}
      >
        <div className="flex flex-col justify-center items-center gap-8">
          <span className="font-bold text-pace-4xl text-center whitespace-pre-line">
            {title}
          </span>
          {buttonText && (
            <Button className="bg-pace-orange-600 text-white px-8 py-4 rounded-full">
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="list-header"
      className={`w-full flex flex-col justify-center items-center ${height} relative`}
      style={{
        background: `linear-gradient(30deg, ${gradientColors.start} 5%, ${gradientColors.middle} 40%, ${gradientColors.end} 50%)`
      }}
    >
      <Carousel
        setApi={setApi}
        className="w-screen h-full flex items-center justify-center"
        opts={{
          align: 'center',
          loop: true
        }}
      >
        <CarouselContent className="w-screen h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="w-screen h-full">
              <div className="flex flex-col justify-center items-center gap-8 h-full">
                <div className="flex flex-col justify-center items-center gap-4 h-full ">
                  <span className="font-bold text-pace-4xl text-center whitespace-pre-line pointer-events-none cursor-default select-none">
                    {slide.title}
                  </span>
                  <span className="font-medium text-pace-xl text-center whitespace-pre-line pointer-events-none cursor-default select-none">
                    {slide.subtitle}
                  </span>
                </div>
                {slide.buttonText && (
                  <Button className="w-[178px] h-[66px]  bg-pace-orange-600 text-white px-10 py-6 rounded-full flex justify-center items-center mx-auto">
                    {slide.buttonText}
                  </Button>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dots Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
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

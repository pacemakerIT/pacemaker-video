'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface ListHeaderProps {
  title?: string;
  buttonText?: string;
  height?: string;
  gradientColors?: {
    start: string;
    middle: string;
    end: string;
  };
  slides?: { title: string; buttonText?: string }[];
  autoPlayInterval?: number;
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
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (autoPlayInterval && slides.length > 1) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [slides.length, autoPlayInterval]);

  // slides가 비어있으면 빈 div 반환
  if (slides.length === 0) {
    return (
      <div
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
      className={`w-full flex flex-col justify-center items-center ${height} relative`}
      style={{
        background: `linear-gradient(30deg, ${gradientColors.start} 5%, ${gradientColors.middle} 40%, ${gradientColors.end} 50%)`
      }}
    >
      <div className="flex flex-col justify-center items-center gap-8">
        <span className="font-bold text-pace-4xl text-center whitespace-pre-line">
          {slides[currentSlide].title}
        </span>
        {slides[currentSlide].buttonText && (
          <button className="bg-pace-orange-600 text-white px-8 py-4 rounded-full">
            {slides[currentSlide].buttonText}
          </button>
        )}
      </div>

      {/* Dots Navigation - slides prop이 있을 때만 표시 */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-pace-orange-600 w-4'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  progress: number;
};

export default function ReviewForm({ progress }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');

  const labels = ['Terrible', 'Bad', 'Okay', 'Good!', 'Amazing'];
  const selectedLabel = labels[Math.ceil(hoverRating ?? rating) - 1];

  const renderStar = (
    starIndex: number,
    currentRating: number
  ): JSX.Element => {
    if (currentRating >= starIndex) {
      return (
        <Image
          src="/icons/full-star.svg"
          width={24}
          height={24}
          alt="Full star"
        />
      );
    } else if (currentRating >= starIndex - 0.5) {
      return (
        <Image
          src="/icons/half-star.svg"
          width={24}
          height={24}
          alt="Half star"
        />
      );
    } else {
      return (
        <Image
          src="/icons/empty-star.svg"
          width={24}
          height={24}
          alt="Empty star"
        />
      );
    }
  };

  const handleSubmit = () => {
    toast('Review uploaded successfully');
    setOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (progress === 100) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const buttonLabel =
    progress === 100
      ? '수강리뷰 쓰러가기'
      : progress === 0
        ? '수강 시작하기'
        : '이어서 수강하기';

  return (
    <>
      <Button
        variant="link"
        className="text-[#E86642] !text-pace-base font-normal p-0 gap-1"
        onClick={handleClick}
      >
        {buttonLabel}
        <span>
          <Image
            src="/icons/arrow-right.svg"
            alt="arrow-right"
            width={20}
            height={20}
          />
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-10 text-pace-black-500"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="justify-between items-center">
            <DialogTitle className="text-[28px] font-bold">
              강의평 남기기
            </DialogTitle>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }}
            >
              <Image
                src="/icons/close_btn.svg"
                alt="close"
                width={40}
                height={40}
              />
            </button>
          </DialogHeader>

          <div className="text-center">
            <p className="text-pace-xl font-medium mb-1">강의가 어땠나요?</p>
            <p className="text-pace-gray-700 font-medium mb-2">
              {selectedLabel}
            </p>

            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => {
                const value = star;
                return (
                  <div key={value} className="relative w-6 h-6">
                    <div
                      className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                      onMouseEnter={() => setHoverRating(value - 0.5)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(value - 0.5)}
                    />
                    <div
                      className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(value)}
                    />
                    <div className="pointer-events-none">
                      {renderStar(value, hoverRating ?? rating)}
                    </div>
                  </div>
                );
              })}
            </div>

            <Textarea
              placeholder="강의에 대한 소감을 말해주세요!"
              className="min-h-[100px] resize-none mb-4 font-light text-pace-base focus:ring-pace-orange-600"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleSubmit}
                className="bg-pace-orange-800 text-white px-6 py-2 rounded-full"
              >
                작성완료
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRating(5);
                  setReviewText('');
                  setOpen(false);
                }}
                className="border-pace-orange-600 text-pace-orange-600 px-6 py-2 rounded-full hover:bg-orange-50"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

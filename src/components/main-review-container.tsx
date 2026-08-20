'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import SignInModal from '@/components/auth/sign-in-modal';

const reviewColumns = [
  [
    {
      name: 'Dan',
      content:
        'Pacemaker has been extremely helpful in preparing for my career. I was feeling lost and out of touch when it comes to preparing for job searching, and Pacemaker has put me back on tracking into attaining the position I was looking for.'
    },
    {
      name: 'Sam',
      content:
        'I always worked closely with Jon to find what sector base opportunity I was looking for. It is an invaluable program & I suggest those that are sitting on the fence to explore the possibilities that it has, thanks!'
    },
    {
      name: 'JD Cho',
      content:
        'Ralph is a PHENOMENAL consultant. He really helps you with your resume, interviews, and with your career overall.'
    }
  ],
  [
    {
      name: 'Yolanda',
      content:
        'From the Cover letter, resume & interview prep, Ralph and Pacemaker really emphasize team work. I really thank them for what I learn now.'
    },
    {
      name: 'Jerry',
      content:
        'They helped me to customize my marketing materials. It translate really well into lots of opportunities. I truly appreciate the team.'
    },
    {
      name: 'Mark',
      content:
        'Pacemaker is a great resource for anyone looking to advance their career in North America.'
    },
    {
      name: 'Emily',
      content:
        'Pacemaker gave me the confidence I needed. The mock interviews and resume reviews were incredibly thorough.'
    },
    {
      name: 'Kevin',
      content:
        'Outstanding mentoring! They truly understand the North American job market and helped me land my dream job.'
    }
  ],
  [
    {
      name: 'PACEMAKER',
      content:
        "and refund. It's a comprehensive career coaching service that helps you focus on interview, resume and networking. I highly recommend Pacemaker. It is a great program.",
      brand: true
    },
    {
      name: 'Lisa',
      content:
        'The might be right to customize my marketing materials that translate really well into and lots of opportunities and I truly appreciate.'
    },
    {
      name: 'Ralph',
      content:
        'Ralph is a PHENOMENAL consultant. He really helps you with your resume, interviews, and career.'
    },
    {
      name: 'Sarah',
      content:
        'Best investment for my career. From networking strategies to interview prep, every session was valuable.'
    },
    {
      name: 'Tony',
      content:
        'The team at Pacemaker went above and beyond to help me prepare. Highly recommended for anyone serious about their career.'
    }
  ]
];

const MainReviewContainer = () => {
  const { userId } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <div className="relative h-[360px] overflow-hidden bg-orange">
      <div className="relative z-10 flex h-full w-full items-center">
        <div className="page-container flex w-full flex-col items-start justify-center gap-6">
          <div className="max-w-[480px] text-left">
            <h2 className="font-headline text-3xl font-extrabold leading-tight text-white md:text-4xl">
              Boost your career with Pacemaker Today
              <span className="footer-cta-exclaim">!</span>
            </h2>
          </div>

          {userId ? (
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-white px-8 py-4 font-headline text-lg font-bold text-white transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-white hover:text-orange"
            >
              Browse online courses
            </Link>
          ) : (
            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border-2 border-white px-8 py-4 font-headline text-lg font-bold text-white transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-white hover:text-orange"
            >
              Log in and start learning
            </button>
          )}
        </div>
      </div>

      <div aria-hidden="true" className="footer-cta-dynamic-wash" />

      <div
        className="footer-cta-review-deck"
        style={{ padding: 0 }}
        aria-hidden="true"
      >
        {reviewColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-1 flex-col gap-[10px]">
            {column.map((review) => (
              <div
                key={`${columnIndex}-${review.name}`}
                className="min-w-[210px] rounded-xl bg-white px-5 py-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={`text-[13px] font-bold ${
                      review.brand ? 'text-orange' : 'text-navy'
                    }`}
                  >
                    {review.name}
                  </span>
                  {!review.brand && (
                    <span className="text-[13px] leading-none text-[#ffb800]">
                      ★★★★★
                    </span>
                  )}
                </div>
                <p className="text-[12px] leading-[1.5] text-[#667085]">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default MainReviewContainer;

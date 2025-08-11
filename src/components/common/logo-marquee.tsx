'use client';

import Image from 'next/image';

const logos = [
  { src: '/img/ibm.svg', alt: 'IBM' },
  { src: '/img/kotra.svg', alt: 'KOTRA' },
  { src: '/img/ontario.svg', alt: 'Ontario' }
];

export default function LogoMarquee() {
  // 반복 횟수 늘리기 → 공백 없이 자연스럽게 이어짐
  const repeatedLogos = [
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos
  ];

  return (
    <div className="w-full bg-white py-4 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {repeatedLogos.map((logo, idx) => (
          <div
            key={`${logo.alt}-${idx}`}
            className="mx-8 inline-block flex-shrink-0"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={100}
              height={40}
              priority
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite; /* 속도 20s */
        }
      `}</style>
    </div>
  );
}

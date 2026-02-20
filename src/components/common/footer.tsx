import { MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FooterProps {
  onLinkClick?: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function Footer({ onLinkClick }: FooterProps) {
  const handleLinkClick =
    (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      if (onLinkClick) {
        onLinkClick(e, href);
      }
    };

  return (
    <footer className="border-t border-pace-orange-800 bg-white py-8 font-sans">
      <div className="container mx-auto max-w-screen-xl px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        {/* 왼쪽: 로고 + 메뉴 */}
        <div className="flex flex-col items-center md:items-start space-y-6">
          {/* pacemaker + 메뉴 */}
          <div className="flex items-center space-x-6">
            <div className="text-pace-2xl font-extrabold text-pace-black-500 leading-none">
              paceup
            </div>
            <div className="flex space-x-6 text-pace-base font-normal text-pace-black-900 leading-[1]">
              {/* 온라인 강의 */}
              <Link
                href="/courses"
                className="hover:underline"
                onClick={handleLinkClick('/courses')}
              >
                온라인 강의
              </Link>
              {/* 전자책 */}
              <Link
                href="/ebooks"
                className="hover:underline"
                onClick={handleLinkClick('/ebooks')}
              >
                전자책
              </Link>
              {/* 오프라인 워크샵 */}
              <Link
                href="workshops"
                className="hover:underline"
                onClick={handleLinkClick('workshops')}
              >
                오프라인 워크샵
              </Link>
            </div>
          </div>

          {/* 주소 + 이메일 + 약관 전부 하나로 묶기 */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-2 text-pace-sm font-normal text-pace-stone-500">
            <span>4789 Yonge St Toronto, ON M2N 0G3</span>
            <span>|</span>
            <span>pacemaker@gmail.com</span>
            <span>·</span>
            {/* 개인정보 처리방침 */}
            <Link
              href="/legal/privacy-policy"
              className="hover:underline"
              onClick={handleLinkClick('/legal/privacy-policy')}
            >
              개인정보 처리방침
            </Link>
            <span>·</span>
            {/* 이용약관 */}
            <Link
              href="/legal/terms-of-use"
              className="hover:underline"
              onClick={handleLinkClick('/legal/terms-of-use')}
            >
              이용약관
            </Link>
            <span>·</span>
            {/* 환불정책 */}
            <Link
              href="/legal/refund-policy"
              className="hover:underline"
              onClick={handleLinkClick('/legal/refund-policy')}
            >
              환불정책
            </Link>
          </div>
        </div>
        {/* 소셜아이콘 + 저작권을 감싸는 큰 div */}
        <div className="flex flex-col items-end space-y-6">
          {/* 소셜 아이콘만 따로 */}
          <div className="flex space-x-4">
            <a
              href="https://facebook.com/globalpacemaker"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75"
              onClick={handleLinkClick('https://facebook.com/globalpacemaker')}
            >
              <Image
                src="/icons/facebook.svg"
                alt="Facebook"
                width={24}
                height={24}
              />
            </a>
            <a
              href="https://www.youtube.com/@pacemaker340"
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75"
              onClick={handleLinkClick('https://www.youtube.com/@pacemaker340')}
            >
              <Image
                src="/icons/youtube.svg"
                alt="YouTube"
                width={24}
                height={24}
              />
            </a>
            <a
              href="https://www.instagram.com/pacemaker_career/"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75"
              onClick={handleLinkClick(
                'https://www.instagram.com/pacemaker_career/'
              )}
            >
              <Image
                src="/icons/instagram.svg"
                alt="Instagram"
                width={24}
                height={24}
              />
            </a>
          </div>

          {/* 카피라이트는 아랫줄 */}
          <div className="text-pace-sm font-normal text-pace-stone-500">
            &copy; 2025 pacemaker all rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

import { MouseEvent } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onLinkClick?: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function Footer({ onLinkClick }: FooterProps) {
  return (
    <footer className="border-t border-[#eaecf0] bg-white pb-[60px] pt-[80px]">
      <div className="page-container">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Left Side: Logo & Social */}
          <div>
            <div className="mb-7">
              <Image
                src="/img/logo.webp"
                alt="Pacemaker Logo"
                width={155}
                height={32}
                className="block h-8 w-auto"
                priority
              />
            </div>

            <div>
              <h5 className="mb-4 text-[0.85rem] font-bold uppercase tracking-[0.16em] text-[#98a2b3]">
                Social
              </h5>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    src: '/icons/instagram.svg',
                    alt: 'Instagram',
                    href: 'https://www.instagram.com/pacemaker_career'
                  },
                  {
                    src: '/icons/facebook.svg',
                    alt: 'Facebook',
                    href: 'https://www.facebook.com/globalpacemaker'
                  },
                  {
                    src: '/icons/youtube.svg',
                    alt: 'YouTube',
                    href: 'https://www.youtube.com/channel/UCyc055VyNuwAMF27dd74smA'
                  },
                  {
                    label: '@',
                    alt: 'Threads',
                    href: 'https://www.threads.com/@pacemaker_career'
                  }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    onClick={(e) => onLinkClick?.(e, social.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.alt}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d0d5dd] text-[#344054] no-underline transition-all hover:border-navy hover:text-navy"
                  >
                    {social.src ? (
                      <Image
                        src={social.src}
                        alt={social.alt || ''}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <span className="font-headline text-[0.85rem] font-extrabold">
                        {social.label}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Contact */}
          <div className="w-full md:ml-auto md:w-fit md:text-right">
            <h5 className="mb-4 text-[0.85rem] font-bold uppercase tracking-[0.16em] text-[#98a2b3] md:text-right">
              Contact
            </h5>
            <ul className="flex list-none flex-col gap-3 md:items-end">
              <li className="flex items-center gap-2 text-[0.9rem] text-[#344054] md:justify-end">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#667085]" />
                <a
                  href="mailto:Hello@pacemakerca.com"
                  onClick={(e) =>
                    onLinkClick?.(e, 'mailto:Hello@pacemakerca.com')
                  }
                  className="text-[#344054] no-underline transition-colors hover:text-navy"
                >
                  Hello@pacemakerca.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-[0.9rem] text-[#344054] md:justify-end">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#667085]" />
                <a
                  href="tel:+16476120523"
                  onClick={(e) => onLinkClick?.(e, 'tel:+16476120523')}
                  className="text-[#344054] no-underline transition-colors hover:text-navy"
                >
                  +1 647-612-0523
                </a>
              </li>
              <li className="flex items-center gap-2 text-[0.9rem] text-[#344054] md:justify-end">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[#667085]" />
                <span>Toronto, ON, Canada</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-[0.9rem] text-[#98a2b3]">
          &copy; {new Date().getFullYear()} Pacemaker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

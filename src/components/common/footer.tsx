import { MouseEvent } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onLinkClick?: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function Footer({ onLinkClick }: FooterProps) {
  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/pacemaker_career',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/globalpacemaker',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/channel/UCyc055VyNuwAMF27dd74smA',
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </svg>
      )
    },
    {
      label: 'Threads',
      href: 'https://www.threads.com/@pacemaker_career',
      icon: (
        <span
          className="font-headline text-[0.85rem] font-extrabold"
          aria-hidden="true"
        >
          @
        </span>
      )
    }
  ];

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
              <p className="mb-4 text-[0.85rem] font-bold uppercase tracking-[0.16em] text-[#98a2b3]">
                Social
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    onClick={(e) => onLinkClick?.(e, social.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d0d5dd] text-[#344054] no-underline transition-all hover:border-navy hover:text-navy"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Contact */}
          <div className="w-full md:ml-auto md:w-fit md:text-right">
            <p className="mb-4 text-[0.85rem] font-bold uppercase tracking-[0.16em] text-[#98a2b3] md:text-right">
              Contact
            </p>
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
          &copy; 2026 Pacemaker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

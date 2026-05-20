import { MouseEvent } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onLinkClick?: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export function Footer({ onLinkClick }: FooterProps) {
  return (
    <footer className="bg-white pt-16 pb-12 border-t-[6px] md:border-t border-orange md:border-gray-100">
      <div className="container mx-auto max-w-7xl px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-12 md:gap-0">
        {/* Left Side: Logo & Social */}
        <div className="flex flex-col gap-10">
          <div className="text-3xl font-extrabold text-[#111827] tracking-tight">
            <Image
              src="/icons/paceup-logo-black.svg"
              alt="Pacemaker Logo"
              width={140}
              height={30}
              className="h-7 w-auto"
              priority
            />
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">
              SOCIAL
            </h5>
            <div className="flex gap-3">
              {[
                {
                  src: '/icons/instagram.svg',
                  alt: 'Instagram',
                  href: 'https://instagram.com/pacemaker_career'
                },
                {
                  src: '/icons/facebook.svg',
                  alt: 'Facebook',
                  href: 'https://facebook.com/globalpacemaker'
                },
                {
                  src: '/icons/youtube.svg',
                  alt: 'YouTube',
                  href: 'https://youtube.com/@pacemaker340'
                },
                {
                  icon: <Mail className="w-5 h-5 text-slate-400" />,
                  href: 'mailto:Hello@pacemakerca.com'
                }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  onClick={(e) => onLinkClick?.(e, social.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#344054] no-underline hover:text-navy transition-colors w-11 h-11 rounded-full flex items-center justify-center text-slate-600"
                >
                  {social.src ? (
                    <Image
                      src={social.src}
                      alt={social.alt || ''}
                      width={20}
                      height={20}
                    />
                  ) : (
                    social.icon
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Contact */}
        <div className="flex flex-col gap-6">
          <h5 className="text-[13px] font-medium text-slate-400 uppercase tracking-widest">
            CONTACT
          </h5>
          <div className="flex flex-col gap-4 text-[17px] text-slate-700">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <a
                href="mailto:Hello@pacemakerca.com"
                onClick={(e) =>
                  onLinkClick?.(e, 'mailto:Hello@pacemakerca.com')
                }
                className="hover:text-orange transition-colors"
              >
                Hello@pacemakerca.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400" />
              <a
                href="tel:+16476120523"
                onClick={(e) => onLinkClick?.(e, 'tel:+16476120523')}
                className="hover:text-orange transition-colors"
              >
                +1 647-612-0523
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span>Toronto, ON, Canada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto max-w-7xl px-6 md:px-12 mt-20">
        <p className="text-slate-400 text-[15px]">
          &copy; {new Date().getFullYear()} Pacemaker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

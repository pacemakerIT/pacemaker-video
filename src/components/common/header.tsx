'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import SignInModalButton from '@/components/auth/sign-in-modal-button';
import SignUpModalButton from '@/components/auth/sign-up-modal-button';
import UserDropdown from '@/components/user/user-drop-down';
import { useCartContext } from '@/app/context/cart-context';
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  CalendarDays,
  SquarePlay,
  BookOpenText,
  ShoppingCart
} from 'lucide-react';

export function Header() {
  const { cart } = useCartContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-[#f2f4f6]">
      <div className="nav-inner relative z-[110] bg-white flex items-center justify-between">
        {/* Logo - Stays fixed on the left */}
        <Link href="/" className="block">
          <Image
            src="/img/logo.webp"
            alt="Pacemaker Logo"
            width={155}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center ml-auto">
          <div className="nav-center">
            <Link href="/workshops" className="nav-item">
              Workshop
            </Link>
            <Link href="/courses" className="nav-item">
              Online Course
            </Link>
            <Link href="/ebooks" className="nav-item">
              E-book
            </Link>
          </div>

          <div className="nav-right ml-4">
            <SignedOut>
              <SignInModalButton className="btn-auth btn-login" />
              <SignUpModalButton className="btn-auth btn-signup" />
            </SignedOut>
            <SignedIn>
              <Link
                href="/mypage/cart"
                className="relative flex items-center p-2 text-navy hover:text-orange transition-colors"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white">
                    {cart.length}
                  </span>
                )}
              </Link>
              <UserDropdown />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu Toggle - Only visible on mobile */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X size={20} className="text-navy" />
            ) : (
              <Menu size={20} className="text-navy" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel - Positioned absolutely below the header */}
      <div
        className={`absolute left-0 right-0 z-[90] md:hidden bg-white border-b border-gray-100 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 scale-y-100'
            : 'opacity-0 -translate-y-2 scale-y-95 pointer-events-none'
        }`}
      >
        <div className="p-5 flex flex-col gap-3">
          <div className="py-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center h-12 rounded-xl px-4 text-base font-bold text-navy hover:bg-gray-50"
            >
              HOME
            </Link>
          </div>

          <div className="py-1">
            <button
              onClick={() => setIsProgramsOpen(!isProgramsOpen)}
              className="flex w-full items-center justify-between h-12 rounded-xl px-4 text-base font-bold text-navy hover:bg-gray-50"
            >
              <span>PROGRAMS</span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 ${isProgramsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isProgramsOpen
                  ? 'grid-rows-[1fr] opacity-100 mt-1'
                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1 pl-2 pb-2">
                  <Link
                    href="/workshops"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-navy/5 transition-all"
                  >
                    <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-navy group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
                      <CalendarDays size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[1rem] font-bold text-navy">
                          Workshops
                        </span>
                        <ChevronRight
                          size={18}
                          className="text-gray-300 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                        />
                      </div>
                      <p className="text-[0.85rem] text-gray-400 font-medium leading-snug">
                        Live sessions, practical events, and real-world
                        feedback.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/courses"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-navy/5 transition-all"
                  >
                    <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-navy group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
                      <SquarePlay size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[1rem] font-bold text-navy">
                          Online Courses
                        </span>
                        <ChevronRight
                          size={18}
                          className="text-gray-300 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                        />
                      </div>
                      <p className="text-[0.85rem] text-gray-400 font-medium leading-snug">
                        Guided lessons to help with resumes, interviews, and
                        career moves.
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/ebooks"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-navy/5 transition-all"
                  >
                    <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-navy group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
                      <BookOpenText size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[1rem] font-bold text-navy">
                          E-books
                        </span>
                        <ChevronRight
                          size={18}
                          className="text-gray-300 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                        />
                      </div>
                      <p className="text-[0.85rem] text-gray-400 font-medium leading-snug">
                        Quick reads with practical tips for searching and
                        applying with confidence.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <SignedOut>
              <SignInModalButton className="w-full h-12 rounded-xl border border-gray-200 text-base font-bold text-navy hover:bg-gray-50" />
              <SignUpModalButton className="w-full h-12 rounded-xl text-base font-bold text-white bg-navy hover:bg-navy/90" />
            </SignedOut>
            <SignedIn>
              <Link
                href="/mypage/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center h-12 rounded-xl px-4 text-base font-bold text-navy hover:bg-gray-50 gap-3"
              >
                <ShoppingCart size={20} />
                Cart ({cart.length})
              </Link>
              <div className="p-4 border-t border-gray-100">
                <UserDropdown />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}

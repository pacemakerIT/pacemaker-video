'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function LanguageDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'KOR' | 'ENG'>(
    'KOR'
  );
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isDropdownOpen &&
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative" ref={langDropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm md:text-base text-pace-black-500 hover:text-pace-orange-800"
      >
        <Image
          src="/icons/globe-01.svg"
          alt="언어 선택 아이콘"
          width={20}
          height={20}
        />
        <span className="font-sans text-pace-sm font-normal text-pace-stone-500">
          {selectedLanguage}
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-20 rounded-xl border border-gray-200 bg-white shadow-md z-50 text-sm py-1">
          {['KOR', 'ENG'].map((lang) => (
            <div
              key={lang}
              className={`flex justify-center items-center px-4 py-2 h-12 text-base font-medium cursor-pointer ${
                selectedLanguage === lang
                  ? 'text-pace-orange-800'
                  : 'text-pace-stone-500 hover:bg-gray-100'
              }`}
              onClick={() => {
                setSelectedLanguage(lang as 'KOR' | 'ENG');
                setIsDropdownOpen(false);
              }}
            >
              {lang}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

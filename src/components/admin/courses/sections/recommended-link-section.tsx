'use client';

import { useState } from 'react';
import Image from 'next/image';
import AddButton from '@/components/ui/admin/add-button';

type LinkItem = {
  url: string;
  name: string;
  errors?: { url?: string; name?: string };
};

type RecommendedLinkSectionProps = {
  onChange?: (links: LinkItem[]) => void;
};

export default function RecommendedLinkSection({
  onChange
}: RecommendedLinkSectionProps) {
  const [links, setLinks] = useState<LinkItem[]>([
    { url: '', name: '', errors: {} }
  ]);

  const handleAddRecommendlink = () => {
    setLinks((prev) => [...prev, { url: '', name: '', errors: {} }]);
  };

  const handleLinkChange = (
    index: number,
    key: 'url' | 'name',
    value: string
  ) => {
    const updated = [...links];
    updated[index][key] = value;
    if (updated[index].errors) {
      updated[index].errors![key] = undefined;
    }
    setLinks(updated);
    onChange?.(updated);
  };

  const handleRemoveLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      {links.map((link, i) => (
        <div key={i} className="flex items-start gap-6">
          <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
            추천 컨텐츠 링크 연결
          </label>

          <div className="flex flex-col flex-1 gap-2 rounded">
            <div className="flex items-center gap-3">
              {/* 첫 번째 input - 링크 URL + 링크 아이콘 */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={link.url}
                  onChange={(e) => handleLinkChange(i, 'url', e.target.value)}
                  className="w-full border border-pace-gray-300 rounded p-3 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Image
                    src="/icons/link.svg"
                    alt="링크 아이콘"
                    width={20}
                    height={20}
                    className="opacity-70"
                  />
                </div>
              </div>

              {/* 두 번째 input - 표시 이름 + ✕ 버튼 */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="표시할 이름"
                  value={link.name}
                  onChange={(e) => handleLinkChange(i, 'name', e.target.value)}
                  className="w-full border border-pace-gray-300 rounded p-3 pr-8"
                />
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(i)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pace-stone-500 hover:text-pace-gray-900"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 에러 메시지 */}
            <div className="flex flex-col">
              {link.errors?.url && (
                <p className="text-pace-orange-500 text-sm mt-1">
                  {link.errors.url}
                </p>
              )}
              {link.errors?.name && (
                <p className="text-pace-orange-500 text-sm mt-1">
                  {link.errors.name}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* 링크 추가 버튼 */}
      <div className="flex justify-end">
        <AddButton label="링크 추가" onClick={handleAddRecommendlink} />
      </div>
    </div>
  );
}

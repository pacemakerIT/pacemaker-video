'use client';

import { useState } from 'react';
import Image from 'next/image';
import AddButton from '@/components/ui/admin/add-button';
import Input from '@/components/ui/admin/input';

import RequiredMark from '@/components/ui/admin/required-mark';

type LinkItem = {
  url: string;
  name: string;
  errors?: { url?: string; name?: string };
};

type RecommendedLinkSectionProps = {
  value?: LinkItem[];
  onChange?: (links: LinkItem[]) => void;
};

export default function RecommendedLinkSection({
  value,
  onChange,
  error
}: RecommendedLinkSectionProps & { error?: string }) {
  const [localLinks, setLocalLinks] = useState<LinkItem[]>([
    { url: '', name: '', errors: {} }
  ]);

  const effectiveLinks = value !== undefined ? value : localLinks;

  // Initialize edit states: if value exists, start as false (view mode), else true (edit mode)
  // Note: We used a ref or simple state initialization. For simplicity with updates:
  // If `value` prop length changes (new item added from parent?), we might need to sync.
  // However, here we only add via internal handler.
  // lets initialize `editStates` based on whether the item has content or if it's new.

  // We'll manage editStates locally.
  // Warning: ensuring it stays in sync with effectiveLinks additions.
  const [editStates, setEditStates] = useState<boolean[]>(() => {
    if (value && value.length > 0) {
      // If we have initial value, check if they are "empty" (new) or have data.
      // Or just assume initial data is "saved".
      return new Array(value.length).fill(false);
    }
    return [true]; // Default one empty item is editing
  });

  const handleAddRecommendlink = () => {
    const newLinks = [...effectiveLinks, { url: '', name: '', errors: {} }];
    if (value === undefined) {
      setLocalLinks(newLinks);
    }
    setEditStates((prev) => [...prev, true]); // New item starts in edit mode
    onChange?.(newLinks);
  };

  const handleLinkChange = (
    index: number,
    key: 'url' | 'name',
    val: string
  ) => {
    const updated = effectiveLinks.map((link, i) =>
      i === index ? { ...link, [key]: val } : link
    );

    if (updated[index].errors) {
      updated[index].errors = { ...updated[index].errors, [key]: undefined };
    }

    if (value === undefined) {
      setLocalLinks(updated);
    }
    onChange?.(updated);
  };

  const handleRemoveLink = (index: number) => {
    const updated = effectiveLinks.filter((_, i) => i !== index);
    if (value === undefined) {
      setLocalLinks(updated);
    }
    setEditStates((prev) => prev.filter((_, i) => i !== index));
    onChange?.(updated);
  };

  const handleResetLink = (index: number) => {
    const updated = effectiveLinks.map((link, i) =>
      i === index ? { url: '', name: '', errors: {} } : link
    );

    if (value === undefined) {
      setLocalLinks(updated);
    }

    setEditStates((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    onChange?.(updated);
  };

  const handleSave = (index: number) => {
    const link = effectiveLinks[index];
    if (!link.url.trim() || !link.name.trim()) {
      const updated = [...effectiveLinks];
      updated[index].errors = {
        url: !link.url.trim() ? 'URL을 입력해주세요.' : undefined,
        name: !link.name.trim() ? '표시할 이름을 입력해주세요.' : undefined
      };
      if (value === undefined) setLocalLinks(updated);
      onChange?.(updated);
      return;
    }

    setEditStates((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-6">
        {effectiveLinks.map((link, i) => (
          <div key={i} className="flex items-start gap-6">
            <label className="w-[216px] text-left text-pace-lg font-bold mt-3">
              추천 컨텐츠 링크 연결
              <RequiredMark />
            </label>

            <div className="flex flex-col flex-1 gap-2 rounded">
              {editStates[i] ? (
                /* Edit Mode */
                <>
                  <div className="flex items-center gap-2 rounded bg-white">
                    <Input
                      type="text"
                      placeholder="https://example.com"
                      value={link.url}
                      onChange={(e) =>
                        handleLinkChange(i, 'url', e.target.value)
                      }
                      className="flex-1 border border-pace-gray-200"
                    />

                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="표시할 이름"
                        value={link.name}
                        onChange={(e) =>
                          handleLinkChange(i, 'name', e.target.value)
                        }
                        className="w-full pr-10 border border-pace-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleSave(i)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                      >
                        <Image
                          src="/icons/link.svg"
                          alt="저장"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                    {/* Delete button (X) for list item even in edit mode to remove unwanted row */}
                    {effectiveLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(i)}
                        className="text-pace-orange-500 hover:text-pace-orange-600 flex-shrink-0 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Validation Errors */}
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
                </>
              ) : (
                /* View Mode */
                <div className="flex items-center justify-between border border-pace-gray-300 rounded bg-white px-3 py-2 h-[50px]">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pace-base text-pace-blue-600 underline truncate flex-1"
                  >
                    {link.name || link.url}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleResetLink(i)}
                    className="ml-3 text-pace-stone-500 hover:text-pace-gray-900"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="pl-[240px] -mt-4">
            <p className="text-pace-orange-500 text-sm">{error}</p>
          </div>
        )}

        {/* 링크 추가 버튼 */}
        <div className="flex justify-end">
          <AddButton label="링크 추가" onClick={handleAddRecommendlink} />
        </div>
      </div>
    </div>
  );
}

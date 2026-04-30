'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ebook } from '@/types/ebook';
import { toast } from 'sonner';

export default function EbookList() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        const res = await fetch('/api/ebooks');
        if (res.ok) {
          const data = await res.json();
          setEbooks(data);
        } else {
          toast('Failed to fetch ebooks');
        }
      } catch (error) {
        toast(`Failed to connect server: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, []);

  if (loading) return <p>📡 전자책 불러오는 중...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📄 전체 전자책 목록</h1>
      {ebooks.length === 0 ? (
        <p>📭 등록된 전자책이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {ebooks.map((ebook) => (
            <div key={ebook.id} className="p-4 border rounded-lg shadow">
              <Link href={`/ebooks/${ebook.id}`}>
                <h2 className="mt-2">{ebook.title}</h2>
                <p>{ebook.description}</p>
              </Link>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}

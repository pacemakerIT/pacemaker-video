'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Document } from '@/types/document';
import { toast } from 'sonner';

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/document');
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        } else {
          toast('Failed to fetch documents');
        }
      } catch (error) {
        toast(`Failed to connect server: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) return <p>📡 문서 불러오는 중...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📄 전체 문서 목록</h1>
      {documents.length === 0 ? (
        <p>📭 등록된 문서가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {documents.map((document) => (
            <div key={document.id} className="p-4 border rounded-lg shadow">
              <Link href={`/document/${document.id}`}>
                <h2 className="mt-2">{document.title}</h2>
                <p>{document.description}</p>
              </Link>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}

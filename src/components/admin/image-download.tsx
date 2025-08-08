import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ImageData {
  id: string;
  fileName: string;
  url: string;
  createdAt: string;
}

const ImageDownload = ({ fileName }: { fileName: string }) => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImageByFileName = async (fileName: string) => {
    try {
      const res = await fetch(`/api/images/file/${fileName}`);
      if (!res.ok) {
        throw new Error('Failed to fetch image');
      }
      const data = await res.json();
      return data.image;
    } catch {
      throw new Error('Image not found');
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!fileName) return;

      setLoading(true);
      setError(null);

      try {
        const image = await fetchImageByFileName(fileName);
        setImageData(image);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load image');
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [fileName]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!imageData)
    return <div className="text-gray-500 p-4">No image found</div>;

  // 프록시 URL 생성 (파일명 사용)
  const proxyUrl = `/api/images/proxy?fileName=${encodeURIComponent(imageData.fileName)}`;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">다운로드된 이미지:</h3>
      <div className="border rounded-lg overflow-hidden">
        <Image
          src={proxyUrl}
          alt="Downloaded Image"
          width={400}
          height={300}
          className="w-full h-auto"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>파일명: {imageData.fileName}</p>
        <p>ID: {imageData.id}</p>
        <p>생성일: {new Date(imageData.createdAt).toLocaleDateString()}</p>
        <p>
          URL:{' '}
          <a
            href={imageData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {imageData.url}
          </a>
        </p>
      </div>
    </div>
  );
};

export default ImageDownload;

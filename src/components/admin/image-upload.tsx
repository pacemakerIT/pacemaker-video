'use client';
import React, { useState } from 'react';
import Image from 'next/image';

const ImageUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    setUploading(false);

    if (data.image.url) {
      setImageUrl(data.image.url);
    } else {
      alert('업로드 실패: ' + (data.error || 'Unknown error'));
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit" disabled={uploading}>
        {uploading ? '업로드 중...' : '업로드'}
      </button>
      {imageUrl && (
        <div>
          <p>업로드된 이미지:</p>
          <Image
            src={imageUrl}
            alt="uploaded"
            width={300}
            height={200}
            style={{ maxWidth: 300, height: 'auto' }}
          />
        </div>
      )}
    </form>
  );
};

export default ImageUpload;

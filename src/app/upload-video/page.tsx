'use client';
import { toast } from 'sonner';

export default function UploadVideo() {
  const handleCreateVideo = async () => {
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: '4e8wv1z7tl',
          uploadDate: new Date().toISOString()
        })
      });

      if (res.ok) {
        toast('Successfully uploaded video');
      } else {
        const { message } = await res.json();
        toast(`Error occurred: ${message}`);
      }
    } catch (error) {
      toast(`Server error: ${error}`);
    } finally {
    }
  };

  return (
    <div>
      <button
        onClick={handleCreateVideo}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        비디오 생성
      </button>
    </div>
  );
}

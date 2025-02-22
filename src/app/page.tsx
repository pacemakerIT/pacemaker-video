import Link from 'next/link';
import Image from 'next/image';
import resume from '../../public/img/resume_lecture.jpeg';
export default async function Home() {
  const videos = [{ id: '4e8wv1z7tl', title: 'video 1' }];

  function goToVideoDetails(mediaId: string): string {
    return `/${mediaId}`;
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {videos.map((video) => (
          <div key={video.id} className="p-4 border rounded-lg shadow">
            <Link href={goToVideoDetails(video.id)}>
              <Image src={resume} alt="" />
              <h2 className="mt-2">{video.title}</h2>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

import VideoList from '@/components/VideoList';

export default async function Home() {
  return (
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <VideoList />
      </div>
    </div>
  );
}

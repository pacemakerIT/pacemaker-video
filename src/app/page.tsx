import VideoList from '@/components/VideoList';
import UserInfo from '@/components/UserInfo';

export default async function Home() {
  return (
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <VideoList />
        <UserInfo />
      </div>
    </div>
  );
}

import { WistiaPlayer } from '@wistia/wistia-player-react';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth();

  // Check if the user is signed in
  if (!userId) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          Please sign in to access this content.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <WistiaPlayer mediaId="4e8wv1z7tl" />
      </div>
    </div>
  );
}

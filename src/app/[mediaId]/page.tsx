import { WistiaPlayer } from '@wistia/wistia-player-react';

export default async function VideoDetails({
  params
}: {
  params: Promise<{ mediaId: string }>;
}) {
  const mediaId = (await params).mediaId;
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1>This is a detail page</h1>
        <WistiaPlayer mediaId={mediaId} />
      </div>
    </div>
  );
}

'use client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PurchaseVideo({ videoId }: { videoId: string }) {
  const router = useRouter();

  const handlePurchaseVideo = async () => {
    try {
      const res = await fetch('/api/purchase-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: '7102003a-8fd5-4191-87c9-a7f49406e996',
          userId: 'bbaa62b4-e3de-4347-985f-39ca54ad3fdb',
          price: 22.33,
          purchasedAt: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast('Successfully purchased video');
        router.push(`/${videoId}`);
      } else {
        toast(`Error: ${data.error}`);
      }
    } catch (error) {
      toast(`Server error: ${error}`);
    }
  };

  return (
    <div>
      <button onClick={handlePurchaseVideo}>Yes</button>
    </div>
  );
}

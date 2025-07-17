'use client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { usePurchase } from '@/app/context/purchase-context';
import { useAuth } from '@clerk/nextjs';

export default function PurchaseVideo({ videoId }: { videoId: string }) {
  const router = useRouter();
  const { setIsPurchased } = usePurchase();
  const { userId } = useAuth();

  const handlePurchaseVideo = async () => {
    try {
      const res = await fetch('/api/purchase-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoId,
          clerkId: userId,
          price: 22.33,
          purchasedAt: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast('Successfully purchased video');
        setIsPurchased(true);
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

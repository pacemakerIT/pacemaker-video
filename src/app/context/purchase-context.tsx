'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

type PurchaseContextType = {
  isPurchased: boolean;
  setIsPurchased: (value: boolean) => void;
  checkPurchaseStatus: (videoId: string) => Promise<void>;
};

const PurchaseContext = createContext<PurchaseContextType | null>(null);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const pathname = usePathname();
  const [isPurchased, setIsPurchased] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const checkPurchaseStatus = useCallback(
    async (videoId: string | undefined) => {
      // Reset purchase status before checking new video
      setIsPurchased(false);

      if (!videoId || !/^[a-zA-Z0-9]+$/.test(videoId)) {
        toast.error('Invalid video ID format');
        return;
      }
      setCurrentVideoId(videoId);

      if (!userId || !videoId || !isLoaded) {
        return;
      }

      try {
        const response = await fetch(
          `/api/purchase-video-status?clerkId=${userId}`
        );
        const data = await response.json();
        setIsPurchased(data.purchasedVideoIds.includes(videoId));
      } catch (error) {
        setIsPurchased(false);
        toast.error(
          error instanceof Error
            ? `Purchase check failed: ${error.message}`
            : 'Failed to check purchase status'
        );
      }
    },
    [userId, isLoaded, setIsPurchased]
  );

  // Effect to get videoId from URL
  useEffect(() => {
    const videoIdFromPath = pathname?.split('/')?.[1];
    if (videoIdFromPath && videoIdFromPath !== currentVideoId) {
      checkPurchaseStatus(videoIdFromPath);
    }
  }, [pathname, checkPurchaseStatus, currentVideoId]);

  // Effect to handle auth state changes and page refreshes
  useEffect(() => {
    if (isLoaded) {
      if (!userId) {
        setIsPurchased(false);
      } else if (currentVideoId) {
        checkPurchaseStatus(currentVideoId);
      }
    }
  }, [userId, isLoaded, currentVideoId, checkPurchaseStatus]);

  return (
    <PurchaseContext.Provider
      value={{
        isPurchased,
        setIsPurchased,
        checkPurchaseStatus
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
}

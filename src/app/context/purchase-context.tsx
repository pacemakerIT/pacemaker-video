'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

type PurchaseContextType = {
  isPurchased: boolean;
  setIsPurchased: (value: boolean) => void;
  checkPurchaseStatus: (videoId: string) => Promise<void>;
};

const PurchaseContext = createContext<PurchaseContextType | null>(null);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const [isPurchased, setIsPurchased] = useState(false);

  const checkPurchaseStatus = useCallback(
    async (videoId: string | undefined) => {
      // Reset purchase status before checking new video
      setIsPurchased(false);

      if (!videoId || !/^[a-zA-Z0-9]+$/.test(videoId)) {
        toast.error('Invalid video ID format');
        return;
      }

      if (!userId || !videoId || !isLoaded) {
        return;
      }

      try {
        const response = await fetch(
          `/api/purchase-video-status?clerkId=${userId}`
        );
        const data = await response.json();

        if (!response.ok || !Array.isArray(data.purchasedVideoIds)) {
          // Expected right after sign-in if the User row hasn't been
          // provisioned yet, or if the user simply has no purchases.
          setIsPurchased(false);
          return;
        }

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

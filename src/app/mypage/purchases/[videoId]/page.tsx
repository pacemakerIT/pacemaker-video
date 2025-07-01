import Link from 'next/link';
import React from 'react';
import PurchaseVideo from '@/components/features/purchase/purchase-video';

export default async function PurchaseLecture({
  params
}: {
  params: Promise<{ videoId: string }>;
}) {
  const videoId = (await params).videoId;

  return (
    <>
      <h1>Do you want to purchase this lecture?</h1>
      <PurchaseVideo videoId={videoId} />
      <Link href="/"> No</Link>
    </>
  );
}

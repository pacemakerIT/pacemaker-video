import Link from 'next/link';
import React from 'react';

export default async function PurchaseLecture({
  params
}: {
  params: Promise<{ mediaId: string }>;
}) {
  const mediaId = (await params).mediaId;

  return (
    <>
      <h1>Do you want to purchase this lecture?</h1>
      <Link href={`/${mediaId}`}>Yes</Link>
      <Link href="/"> No</Link>
    </>
  );
}

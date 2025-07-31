import { ItemType } from '@prisma/client';

export async function getFavorites(userId: string) {
  const res = await fetch(`/api/favorite?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

export async function addFavorite({
  userId,
  itemId,
  itemType
}: {
  userId: string;
  itemId: string;
  itemType: ItemType;
}) {
  const res = await fetch('/api/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId, itemType })
  });
  if (!res.ok) throw new Error('Failed to add favorite');
  return res.json();
}

export async function removeFavorite({
  userId,
  itemId,
  itemType
}: {
  userId: string;
  itemId: string;
  itemType: ItemType;
}) {
  const url = `/api/favorite?userId=${userId}&itemId=${itemId}&itemType=${itemType}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove favorite');
  return res.json();
}

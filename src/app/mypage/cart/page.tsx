import prisma from '@/lib/prisma';
import CartContent from '@/components/features/mypage/cart/cart-content';
import CartRecommendations from '@/components/features/mypage/cart/cart-recommendations';
import { ItemType } from '@prisma/client';

export default async function CartPage() {
  const ebookSelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    category: true,
    thumbnail: true
  };
  const courseSelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    category: true,
    thumbnailUrl: true
  };
  const [ebooks, courses] = await Promise.all([
    prisma.ebook.findMany({
      where: { isPublic: true },
      select: ebookSelect,
      orderBy: { orderKey: 'asc' },
      take: 3
    }),
    prisma.course.findMany({
      where: { isPublic: true },
      select: courseSelect,
      orderBy: { orderKey: 'asc' },
      take: 3
    })
  ]);
  const recommendations = [
    ...ebooks.slice(0, 1).map((item) => ({
      ...item,
      title: item.title ?? '',
      type: ItemType.EBOOK
    })),
    ...courses.map((item) => ({
      ...item,
      title: item.title ?? '',
      price: item.price === null ? null : Number(item.price),
      thumbnail: item.thumbnailUrl,
      type: ItemType.COURSE
    })),
    ...ebooks.slice(1).map((item) => ({
      ...item,
      title: item.title ?? '',
      type: ItemType.EBOOK
    }))
  ];
  return (
    <CartContent>
      <CartRecommendations items={recommendations} />
    </CartContent>
  );
}

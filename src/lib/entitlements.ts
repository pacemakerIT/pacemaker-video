import { ItemType, OrderStatus, Prisma } from '@prisma/client';

type EntitlementClient = Pick<
  Prisma.TransactionClient,
  'course' | 'ebook' | 'orderItem' | 'user' | 'video'
>;

export function isFreePrice(price: number | string | null | undefined) {
  if (price === null || price === undefined || price === '') return true;

  if (typeof price === 'number') {
    return Number.isFinite(price) && price <= 0;
  }

  const normalized = price.trim().replace(/[^0-9.-]+/g, '');
  if (!normalized) return false;

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount <= 0;
}

export async function findUserIdByClerkId(
  client: EntitlementClient,
  clerkUserId: string
) {
  const user = await client.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true }
  });

  return user?.id ?? null;
}

export async function hasCompletedPurchase(
  client: EntitlementClient,
  userId: string,
  itemType: ItemType,
  itemId: string
) {
  const orderItem = await client.orderItem.findFirst({
    where: {
      itemId,
      itemType,
      order: {
        userId,
        status: OrderStatus.COMPLETED
      }
    },
    select: { id: true }
  });

  return Boolean(orderItem);
}

export async function userCanAccessCourse(
  client: EntitlementClient,
  userId: string | null,
  course: {
    id: string;
    price: string | null;
  }
) {
  if (isFreePrice(course.price)) return true;
  if (!userId) return false;

  return hasCompletedPurchase(client, userId, ItemType.COURSE, course.id);
}

export async function getAccessibleCourseVideoIds(
  client: EntitlementClient,
  userId: string | null,
  course: {
    id: string;
    price: string | null;
  },
  videoIds: string[]
) {
  if (!videoIds.length) return new Set<string>();

  const canAccessFullCourse = await userCanAccessCourse(client, userId, course);

  if (canAccessFullCourse) return new Set(videoIds);
  if (!userId) return new Set<string>();

  const orderItems = await client.orderItem.findMany({
    where: {
      itemId: { in: videoIds },
      itemType: ItemType.VIDEO,
      order: {
        userId,
        status: OrderStatus.COMPLETED
      }
    },
    select: { itemId: true }
  });

  return new Set(orderItems.map((item) => item.itemId));
}

export async function userCanAccessEbook(
  client: EntitlementClient,
  userId: string | null,
  ebook: {
    id: string;
    price: number | null;
  }
) {
  if (isFreePrice(ebook.price)) return true;
  if (!userId) return false;

  return hasCompletedPurchase(client, userId, ItemType.EBOOK, ebook.id);
}

export async function userCanAccessVideo(
  client: EntitlementClient,
  userId: string | null,
  video: {
    id: string;
    price: number | null;
    courseId: string | null;
    course?: {
      id: string;
      price: string | null;
    } | null;
  }
) {
  const requiresPurchase =
    !isFreePrice(video.price) ||
    Boolean(video.course && !isFreePrice(video.course.price));

  if (!requiresPurchase) return true;
  if (!userId) return false;

  const purchaseFilters: Prisma.OrderItemWhereInput[] = [
    {
      itemId: video.id,
      itemType: ItemType.VIDEO
    }
  ];

  if (video.courseId) {
    purchaseFilters.push({
      itemId: video.courseId,
      itemType: ItemType.COURSE
    });
  }

  const orderItem = await client.orderItem.findFirst({
    where: {
      OR: purchaseFilters,
      order: {
        userId,
        status: OrderStatus.COMPLETED
      }
    },
    select: { id: true }
  });

  return Boolean(orderItem);
}

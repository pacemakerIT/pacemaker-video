'use server';

import prisma from '@/lib/prisma';
import { EbookCategory, TargetAudienceType } from '@prisma/client';
import { generateKeyBetween } from 'fractional-indexing';
import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/admin-auth';

async function requireAdminAction() {
  const adminAccess = await requireAdminUser();
  if (!adminAccess.ok) {
    throw new Error(adminAccess.error);
  }
}

export type EbookData = {
  id?: string;
  category: EbookCategory;
  isPublic: string;
  showOnMain: boolean;
  title: string;
  intro: string;
  subTitle: string;
  subDescription: string;
  price: string;
  time?: string;
  thumbnailUrl: string;
  fileUrl: string;
  visualTitle: string;
  visualTitle2: string;
  recommended: TargetAudienceType[];
  sections: {
    title: string;
    content: string;
  }[];
  links: {
    url: string;
    name: string;
  }[];
};

export async function createEbook(data: EbookData) {
  await requireAdminAction();
  try {
    const {
      category,
      isPublic,
      showOnMain,
      title,
      intro,
      subTitle,
      subDescription,
      price,
      time,
      thumbnailUrl,
      fileUrl,
      visualTitle,
      visualTitle2,
      recommended: targetAudienceTypes,
      sections,
      links
    } = data;

    const columnCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Ebook'
          AND column_name = 'time'
      )::boolean AS exists
    `;
    const hasTimeColumn = Boolean(columnCheck[0]?.exists);

    const validLinks = Array.isArray(links)
      ? links.filter((l) => (l?.url ?? '').trim() && (l?.name ?? '').trim())
      : [];
    const safeSections = Array.isArray(sections) ? sections : [];

    const last = await prisma.ebook.findFirst({
      orderBy: { orderKey: 'desc' },
      select: { orderKey: true }
    });
    const nextKey = generateKeyBetween(last?.orderKey ?? null, null);

    const created = await prisma.ebook.create({
      data: {
        ebookId: `ebook-${Date.now()}`,
        title,
        description: intro,
        category,
        isPublic: isPublic === 'public',
        isMain: showOnMain,
        price: parseFloat(price) || 0,
        thumbnail: thumbnailUrl,
        bucketUrl: fileUrl,
        subTitle,
        subDescription,
        visualTitle1: visualTitle,
        visualTitle2: visualTitle2,
        targetAudienceTypes,
        tableOfContents: safeSections,
        recommendedLinks: validLinks,
        orderKey: nextKey
      }
    });

    if (hasTimeColumn) {
      await prisma.$executeRawUnsafe(
        'UPDATE "Ebook" SET "time" = $1 WHERE "id" = $2::uuid',
        time ?? '',
        created.id
      );
    }

    revalidatePath('/admin/ebooks');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create ebook: ${message}`);
  }
}

export async function updateEbook(id: string, data: EbookData) {
  await requireAdminAction();
  try {
    const {
      category,
      isPublic,
      showOnMain,
      title,
      intro,
      subTitle,
      subDescription,
      price,
      time,
      thumbnailUrl,
      fileUrl,
      visualTitle,
      visualTitle2,
      recommended: targetAudienceTypes,
      sections,
      links
    } = data;

    const columnCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Ebook'
          AND column_name = 'time'
      )::boolean AS exists
    `;
    const hasTimeColumn = Boolean(columnCheck[0]?.exists);

    const validLinks = Array.isArray(links)
      ? links.filter((l) => (l?.url ?? '').trim() && (l?.name ?? '').trim())
      : [];
    const safeSections = Array.isArray(sections) ? sections : [];

    await prisma.ebook.update({
      where: { id },
      data: {
        title,
        description: intro,
        category,
        isPublic: isPublic === 'public',
        isMain: showOnMain,
        price: parseFloat(price) || 0,
        thumbnail: thumbnailUrl,
        bucketUrl: fileUrl,
        subTitle,
        subDescription,
        visualTitle1: visualTitle,
        visualTitle2: visualTitle2,
        targetAudienceTypes,
        tableOfContents: safeSections,
        recommendedLinks: validLinks
      }
    });

    if (hasTimeColumn) {
      await prisma.$executeRawUnsafe(
        'UPDATE "Ebook" SET "time" = $1 WHERE "id" = $2::uuid',
        time ?? '',
        id
      );
    }

    revalidatePath('/admin/ebooks');
    revalidatePath(`/admin/ebooks/${id}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to update ebook: ${message}`);
  }
}

export async function getEbooks(page = 1, limit = 10) {
  await requireAdminAction();
  const skip = (page - 1) * limit;
  const total = await prisma.ebook.count();

  // 1) Fetch paginated ebooks
  const ebooks = await prisma.ebook.findMany({
    skip,
    take: limit,
    orderBy: [{ orderKey: 'asc' }]
  });

  if (ebooks.length === 0) {
    return {
      items: [],
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };
  }

  const ebookIds = ebooks.map((doc) => doc.id);

  // 2) Aggregate likes in one query
  const likeCounts = await prisma.favorite.groupBy({
    by: ['itemId'],
    where: {
      itemType: 'EBOOK',
      itemId: { in: ebookIds }
    },
    _count: { _all: true }
  });

  // 3) Aggregate completed purchases in one query
  const purchaseCounts = await prisma.orderItem.groupBy({
    by: ['itemId'],
    where: {
      itemType: 'EBOOK',
      itemId: { in: ebookIds },
      order: { status: 'COMPLETED' }
    },
    _count: { _all: true }
  });

  const likeCountMap = new Map(
    likeCounts.map((row) => [row.itemId, row._count._all])
  );
  const purchaseCountMap = new Map(
    purchaseCounts.map((row) => [row.itemId, row._count._all])
  );

  const items = ebooks.map((doc) => ({
    ...doc,
    likes: likeCountMap.get(doc.id) ?? 0,
    purchaseCount: purchaseCountMap.get(doc.id) ?? 0
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

export type EbookWithStats = Awaited<
  ReturnType<typeof getEbooks>
>['items'][number];

export async function getEbook(id: string) {
  await requireAdminAction();
  const ebook = await prisma.ebook.findUnique({
    where: { id }
  });
  return ebook;
}

export async function deleteEbooks(ids: string[]) {
  await requireAdminAction();
  try {
    const { count } = await prisma.ebook.deleteMany({
      where: { id: { in: ids } }
    });
    revalidatePath('/admin/ebooks');
    return { count };
  } catch {
    throw new Error('Failed to delete ebooks');
  }
}

export async function updateEbookStatuses(
  updates: { id: string; isPublic: boolean }[]
) {
  await requireAdminAction();
  try {
    await prisma.$transaction(
      updates.map(({ id, isPublic }) =>
        prisma.ebook.update({
          where: { id },
          data: { isPublic }
        })
      )
    );
    revalidatePath('/admin/ebooks');
  } catch {
    throw new Error('Failed to update ebook statuses');
  }
}

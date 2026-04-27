'use server';

import prisma from '@/lib/prisma';
import { EbookCategory, TargetAudienceType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
      thumbnailUrl,
      fileUrl,
      visualTitle,
      visualTitle2,
      recommended: targetAudienceTypes,
      sections,
      links
    } = data;

    // Filter out empty links (links are optional)
    const validLinks = links.filter((l) => l.url.trim() && l.name.trim());

    await prisma.ebook.create({
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
        tableOfContents: sections,
        recommendedLinks: validLinks
      }
    });

    revalidatePath('/admin/ebooks');
  } catch {
    throw new Error('Failed to create ebook');
  }
  redirect('/admin/ebooks');
}

export async function updateEbook(id: string, data: EbookData) {
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
      thumbnailUrl,
      fileUrl,
      visualTitle,
      visualTitle2,
      recommended: targetAudienceTypes,
      sections,
      links
    } = data;

    // Filter out empty links (links are optional)
    const validLinks = links.filter((l) => l.url.trim() && l.name.trim());

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
        tableOfContents: sections,
        recommendedLinks: validLinks
      }
    });

    revalidatePath('/admin/ebooks');
    revalidatePath(`/admin/ebooks/${id}`);
  } catch {
    throw new Error('Failed to update ebook');
  }
  redirect('/admin/ebooks');
}

export async function getEbooks(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await prisma.ebook.count();

  const ebooks = await prisma.ebook.findMany({
    skip,
    take: limit,
    orderBy: [{ uploadDate: 'desc' }, { id: 'desc' }]
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

  const ebookIds = ebooks.map((ebook) => ebook.id);

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

  const items = ebooks.map((ebook) => ({
    ...ebook,
    likes: likeCountMap.get(ebook.id) ?? 0,
    purchaseCount: purchaseCountMap.get(ebook.id) ?? 0
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
  const ebook = await prisma.ebook.findUnique({
    where: { id }
  });
  return ebook;
}

export async function deleteEbook(id: string) {
  try {
    await prisma.ebook.delete({
      where: { id }
    });
    revalidatePath('/admin/ebooks');
  } catch {
    throw new Error('Failed to delete ebook');
  }
}

export async function updateEbookStatuses(
  updates: { id: string; isPublic: boolean }[]
) {
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

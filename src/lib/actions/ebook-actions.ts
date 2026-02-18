'use server';

import prisma from '@/lib/prisma';
import { DocumentCategory, TargetAudienceType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function mapCategoryToEnum(category: string): DocumentCategory {
  const map: Record<string, DocumentCategory> = {
    INTERVIEW: DocumentCategory.SERVICE,
    RESUME: DocumentCategory.SERVICE,
    NETWORKING: DocumentCategory.SERVICE,
    MARKETING: DocumentCategory.MARKETING,
    IT: DocumentCategory.IT,
    DESIGN: DocumentCategory.DESIGN,
    PUBLIC: DocumentCategory.PUBLIC,
    ACCOUNTING: DocumentCategory.ACCOUNTING,
    SERVICE: DocumentCategory.SERVICE
  };
  const result = map[category.toUpperCase()];
  if (!result) throw new Error(`Invalid category: ${category}`);
  return result;
}

function mapRecommendedToEnum(r: string): TargetAudienceType {
  switch (r) {
    case 'IT 개발':
      return TargetAudienceType.IT;
    case '공무원':
      return TargetAudienceType.GOVERNMENT;
    case '재무회계':
      return TargetAudienceType.FINANCE;
    case '디자인':
      return TargetAudienceType.DESIGN;
    case '북미 취업이력서':
      return TargetAudienceType.RESUME;
    case '인터뷰 준비':
      return TargetAudienceType.INTERVIEW;
    case '네트워킹':
      return TargetAudienceType.NETWORKING;
    case '서비스':
      return TargetAudienceType.SERVICE;
    default:
      return TargetAudienceType.IT;
  }
}

export type EbookData = {
  id?: string;
  category: string;
  isPublic: string;
  showOnMain: boolean;
  title: string;
  intro: string;
  processTitle: string;
  processContent: string;
  price: string;
  thumbnailUrl: string;
  fileUrl: string;
  visualTitle: string;
  visualTitle2: string;
  recommended: string[];
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
      processTitle,
      processContent,
      price,
      thumbnailUrl,
      fileUrl,
      visualTitle,
      visualTitle2,
      recommended,
      sections,
      links
    } = data;

    // Map category string to Enum
    const categoryEnum = mapCategoryToEnum(category);

    // Map recommended strings to Enum
    const targetAudienceTypes = recommended.map(mapRecommendedToEnum);

    // Filter out empty links (links are optional)
    const validLinks = links.filter((l) => l.url.trim() && l.name.trim());

    await prisma.document.create({
      data: {
        documentId: `ebook-${Date.now()}`,
        title,
        description: intro,
        category: categoryEnum,
        isPublic: isPublic === 'public',
        isMain: showOnMain,
        price: parseFloat(price) || 0,
        thumbnail: thumbnailUrl,
        bucketUrl: fileUrl,
        processTitle,
        processContent,
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
      processTitle,
      processContent,
      price,
      thumbnailUrl,
      fileUrl,
      visualTitle,
      visualTitle2,
      recommended,
      sections,
      links
    } = data;

    const categoryEnum = mapCategoryToEnum(category);

    const targetAudienceTypes = recommended.map(mapRecommendedToEnum);

    // Filter out empty links (links are optional)
    const validLinks = links.filter((l) => l.url.trim() && l.name.trim());

    await prisma.document.update({
      where: { id },
      data: {
        title,
        description: intro,
        category: categoryEnum,
        isPublic: isPublic === 'public',
        isMain: showOnMain,
        price: parseFloat(price) || 0,
        thumbnail: thumbnailUrl,
        bucketUrl: fileUrl,
        processTitle,
        processContent,
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

  // 1. Fetch documents
  const documents = await prisma.document.findMany({
    skip,
    take: limit,
    orderBy: { uploadDate: 'desc' }
  });

  // 2. Enhance with counts (Polyfill for polymorphic relations)
  // Since we can't easily join on polymorphic fields without schema changes or raw queries,
  // we'll fetch counts for these specific IDs.

  const enhancedDocuments = await Promise.all(
    documents.map(async (doc) => {
      const likes = await prisma.favorite.count({
        where: {
          itemId: doc.id,
          itemType: 'EBOOK'
        }
      });

      const purchaseCount = await prisma.orderItem.count({
        where: {
          itemId: doc.id,
          itemType: 'EBOOK',
          order: {
            status: 'COMPLETED'
          }
        }
      });

      return {
        ...doc,
        likes,
        purchaseCount
      };
    })
  );

  return enhancedDocuments;
}

export type EbookWithStats = Awaited<ReturnType<typeof getEbooks>>[number];

export async function getEbook(id: string) {
  const document = await prisma.document.findUnique({
    where: { id }
  });
  return document;
}

export async function deleteEbook(id: string) {
  try {
    await prisma.document.delete({
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
        prisma.document.update({
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

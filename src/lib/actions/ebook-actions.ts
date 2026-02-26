'use server';

import prisma from '@/lib/prisma';
import { DocumentCategory, TargetAudienceType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
    // Assuming input 'Marketing' -> DocumentCategory.MARKETING
    const categoryEnum = Object.values(DocumentCategory).find(
      (c) => c === category.toUpperCase()
    );

    if (!categoryEnum) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Map recommended strings to Enum
    const targetAudienceTypes = recommended.map((r) => {
      // Simple mapping based on known values, or uppercase
      // Adjust this mapping based on exact string values from frontend
      // Frontend options: IT 개발, 공무원, 재무회계, 디자인, 북미 취업이력서, 인터뷰 준비, 네트워킹, 서비스
      // Schema Enum: IT, GOVERNMENT, FINANCE, DESIGN, RESUME, INTERVIEW, NETWORKING, SERVICE
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
          return TargetAudienceType.IT; // Fallback or throw
      }
    });

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
        recommendedLinks: links
      }
    });

    revalidatePath('/admin/ebooks');
  } catch (error) {
    console.error('Failed to create ebook:', error);
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

    const categoryEnum = Object.values(DocumentCategory).find(
      (c) => c === category.toUpperCase()
    );

    const targetAudienceTypes = recommended.map((r) => {
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
    });

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
        recommendedLinks: links
      }
    });

    revalidatePath('/admin/ebooks');
    revalidatePath(`/admin/ebooks/${id}`);
  } catch (error) {
    console.error('Failed to update ebook:', error);
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
  } catch (error) {
    console.error('Failed to batch update ebook statuses:', error);
    throw new Error('Failed to update ebook statuses');
  }
}

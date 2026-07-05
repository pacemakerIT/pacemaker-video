import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  ebook: {
    findFirst: vi.fn(),
    findMany: vi.fn()
  }
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  })
}));

vi.mock('@/components/features/ebook/ebook-detail-container', () => ({
  default: vi.fn(() => null)
}));

const { notFound } = await import('next/navigation');
const { default: EbookDetailPage } = await import('./page');

function pageContext(ebookId = 'ebook-123') {
  return {
    params: Promise.resolve({ ebookId })
  };
}

describe('Ebook detail page visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.ebook.findFirst.mockResolvedValue({
      title: 'Public Ebook',
      description: 'Ebook description',
      price: 25,
      subTitle: 'Subtitle',
      targetAudienceTypes: [],
      tableOfContents: [],
      category: 'IT',
      visualTitle1: 'Visual title',
      visualTitle2: 'Visual title 2',
      subDescription: 'Sub description'
    });
    prismaMock.ebook.findMany.mockResolvedValue([]);
  });

  it('queries ebook details through the public visibility policy', async () => {
    await EbookDetailPage(pageContext());

    expect(prismaMock.ebook.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ebook-123', isPublic: true }
      })
    );
  });

  it('returns notFound when the ebook is missing or private', async () => {
    prismaMock.ebook.findFirst.mockResolvedValue(null);

    await expect(EbookDetailPage(pageContext())).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );
    expect(notFound).toHaveBeenCalled();
    expect(prismaMock.ebook.findMany).not.toHaveBeenCalled();
  });
});

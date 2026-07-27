import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemType } from '@prisma/client';
import { getCheckoutCartItems } from '../checkout-items';

const tx = {
  cart: {
    findMany: vi.fn()
  },
  course: {
    findFirst: vi.fn()
  },
  ebook: {
    findFirst: vi.fn()
  },
  workshop: {
    findUnique: vi.fn()
  },
  video: {
    findFirst: vi.fn()
  }
};

describe('checkout item visibility policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.cart.findMany.mockResolvedValue([]);
    tx.course.findFirst.mockResolvedValue(null);
    tx.ebook.findFirst.mockResolvedValue(null);
    tx.workshop.findUnique.mockResolvedValue(null);
    tx.video.findFirst.mockResolvedValue(null);
  });

  it('resolves public courses for checkout', async () => {
    tx.cart.findMany.mockResolvedValue([
      {
        id: 'cart-1',
        itemId: '11111111-1111-4111-8111-111111111111',
        itemType: ItemType.COURSE
      }
    ]);
    tx.course.findFirst.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      title: 'Public Course',
      description: 'Course description',
      price: '49.99',
      category: 'INTERVIEW',
      thumbnailUrl: '/course.jpg'
    });

    const items = await getCheckoutCartItems(tx as never, 'user-123', [
      {
        itemId: '11111111-1111-4111-8111-111111111111',
        itemType: ItemType.COURSE
      }
    ]);

    expect(tx.course.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: '11111111-1111-4111-8111-111111111111',
          isPublic: true
        }
      })
    );
    expect(items).toEqual([
      expect.objectContaining({
        itemType: ItemType.COURSE,
        title: 'Public Course'
      })
    ]);
  });

  it('blocks private courses from checkout by treating them as unavailable', async () => {
    tx.cart.findMany.mockResolvedValue([
      {
        id: 'cart-1',
        itemId: '11111111-1111-4111-8111-111111111111',
        itemType: ItemType.COURSE
      }
    ]);
    tx.course.findFirst.mockResolvedValue(null);

    await expect(
      getCheckoutCartItems(tx as never, 'user-123', [
        {
          itemId: '11111111-1111-4111-8111-111111111111',
          itemType: ItemType.COURSE
        }
      ])
    ).rejects.toMatchObject({
      message: 'One or more selected items are unavailable',
      status: 400
    });
  });

  it('resolves ebooks through the public visibility policy', async () => {
    tx.cart.findMany.mockResolvedValue([
      {
        id: 'cart-1',
        itemId: 'ebook-file.pdf',
        itemType: ItemType.EBOOK
      }
    ]);
    tx.ebook.findFirst.mockResolvedValue({
      id: 'ebook-123',
      title: 'Public Ebook',
      description: 'Ebook description',
      price: 29,
      category: 'IT',
      thumbnail: '/ebook.jpg'
    });

    await getCheckoutCartItems(tx as never, 'user-123', [
      {
        itemId: 'ebook-file.pdf',
        itemType: ItemType.EBOOK
      }
    ]);

    expect(tx.ebook.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isPublic: true,
          OR: [{ ebookId: 'ebook-file.pdf' }]
        }
      })
    );
  });
});

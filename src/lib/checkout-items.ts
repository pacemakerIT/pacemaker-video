import { ItemType, OrderStatus, Prisma } from '@prisma/client';
import { amountToCents } from './money';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const CHECKOUT_CURRENCY = 'cad';

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CheckoutError';
    this.status = status;
  }
}

export type CheckoutSelection = {
  itemId: string;
  itemType: ItemType;
};

export type CheckoutCartItem = {
  cartId: string;
  cartItemId: string;
  itemId: string;
  itemType: ItemType;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail: string | null;
  startsAt: Date | null;
  unitAmountCents: number;
  quantity: number;
};

type CartRow = {
  id: string;
  itemId: string;
  itemType: ItemType;
};

type PrismaTx = Prisma.TransactionClient;

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function selectionKey(selection: CheckoutSelection) {
  return `${selection.itemType}:${selection.itemId}`;
}

function isItemType(value: unknown): value is ItemType {
  return (
    typeof value === 'string' &&
    Object.values(ItemType).includes(value as ItemType)
  );
}

function normalizePriceToCents(
  price: number | string | null | undefined,
  itemLabel: string
) {
  const amount =
    typeof price === 'number'
      ? price
      : Number(String(price ?? '').replace(/[^0-9.-]+/g, ''));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new CheckoutError(`${itemLabel} has an invalid price`, 400);
  }

  return amountToCents(amount);
}

export function parseCheckoutSelections(body: unknown): CheckoutSelection[] {
  const value = body as {
    items?: unknown;
    selectedItems?: unknown;
  };
  const rawItems = value.selectedItems ?? value.items;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new CheckoutError('No checkout items selected', 400);
  }

  const unique = new Map<string, CheckoutSelection>();

  for (const rawItem of rawItems) {
    const item = rawItem as { itemId?: unknown; itemType?: unknown };
    const itemId = typeof item.itemId === 'string' ? item.itemId.trim() : '';

    if (!itemId || !isItemType(item.itemType)) {
      throw new CheckoutError('Invalid checkout item selection', 400);
    }

    const selection = { itemId, itemType: item.itemType };
    unique.set(selectionKey(selection), selection);
  }

  return [...unique.values()];
}

async function resolveCartItem(
  tx: PrismaTx,
  cart: CartRow
): Promise<CheckoutCartItem | null> {
  switch (cart.itemType) {
    case ItemType.COURSE: {
      if (!isUuid(cart.itemId)) return null;

      const course = await tx.course.findFirst({
        where: { id: cart.itemId, isPublic: true },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          thumbnailUrl: true
        }
      });

      if (!course) return null;

      const title = course.title || 'Untitled course';

      return {
        cartId: cart.id,
        cartItemId: cart.itemId,
        itemId: course.id,
        itemType: cart.itemType,
        title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnailUrl,
        startsAt: null,
        unitAmountCents: normalizePriceToCents(course.price, title),
        quantity: 1
      };
    }
    case ItemType.EBOOK: {
      const ebook = await tx.ebook.findFirst({
        where: {
          isPublic: true,
          OR: [
            { ebookId: cart.itemId },
            ...(isUuid(cart.itemId) ? [{ id: cart.itemId }] : [])
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          thumbnail: true
        }
      });

      if (!ebook) return null;

      const title = ebook.title || 'Untitled ebook';

      return {
        cartId: cart.id,
        cartItemId: cart.itemId,
        itemId: ebook.id,
        itemType: cart.itemType,
        title,
        description: ebook.description,
        category: ebook.category,
        thumbnail: ebook.thumbnail,
        startsAt: null,
        unitAmountCents: normalizePriceToCents(ebook.price, title),
        quantity: 1
      };
    }
    case ItemType.WORKSHOP: {
      if (!isUuid(cart.itemId)) return null;

      const workshop = await tx.workshop.findUnique({
        where: { id: cart.itemId },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          thumbnail: true,
          startDate: true
        }
      });

      if (!workshop) return null;

      return {
        cartId: cart.id,
        cartItemId: cart.itemId,
        itemId: workshop.id,
        itemType: cart.itemType,
        title: workshop.title,
        description: workshop.description,
        category: workshop.category,
        thumbnail: workshop.thumbnail,
        startsAt: workshop.startDate,
        unitAmountCents: normalizePriceToCents(workshop.price, workshop.title),
        quantity: 1
      };
    }
    case ItemType.VIDEO: {
      const video = await tx.video.findFirst({
        where: {
          OR: [
            { videoId: cart.itemId },
            ...(isUuid(cart.itemId) ? [{ id: cart.itemId }] : [])
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          thumbnail: true
        }
      });

      if (!video) return null;

      const title = video.title || 'Untitled video';

      return {
        cartId: cart.id,
        cartItemId: cart.itemId,
        itemId: video.id,
        itemType: cart.itemType,
        title,
        description: video.description,
        category: video.category,
        thumbnail: video.thumbnail,
        startsAt: null,
        unitAmountCents: normalizePriceToCents(video.price, title),
        quantity: 1
      };
    }
    default:
      return null;
  }
}

export async function getCheckoutCartItems(
  tx: PrismaTx,
  userId: string,
  selections: CheckoutSelection[]
) {
  if (!selections.length) {
    throw new CheckoutError('No checkout items selected', 400);
  }

  const carts = await tx.cart.findMany({
    where: {
      userId,
      OR: selections.map((selection) => ({
        itemId: selection.itemId,
        itemType: selection.itemType
      }))
    },
    select: {
      id: true,
      itemId: true,
      itemType: true
    }
  });

  const cartsByKey = new Map(carts.map((cart) => [selectionKey(cart), cart]));
  const missingSelections = selections.filter(
    (selection) => !cartsByKey.has(selectionKey(selection))
  );

  if (missingSelections.length) {
    throw new CheckoutError('Selected cart items were not found', 400);
  }

  const orderedCarts = selections.map(
    (selection) => cartsByKey.get(selectionKey(selection)) as CartRow
  );
  const checkoutItems = await Promise.all(
    orderedCarts.map((cart) => resolveCartItem(tx, cart))
  );

  if (checkoutItems.some((item) => !item)) {
    throw new CheckoutError('One or more selected items are unavailable', 400);
  }

  return checkoutItems as CheckoutCartItem[];
}

export async function assertNoCompletedPurchases(
  tx: PrismaTx,
  userId: string,
  items: CheckoutCartItem[]
) {
  const purchasedItems = await tx.orderItem.findMany({
    where: {
      OR: items.map((item) => ({
        itemId: item.itemId,
        itemType: item.itemType
      })),
      order: {
        userId,
        status: OrderStatus.COMPLETED
      }
    },
    select: {
      itemId: true,
      itemType: true
    }
  });

  if (!purchasedItems.length) return;

  const purchasedKeys = new Set(
    purchasedItems.map((item) => selectionKey(item))
  );
  const purchasedTitles = items
    .filter((item) => purchasedKeys.has(selectionKey(item)))
    .map((item) => item.title);

  throw new CheckoutError(
    `Already purchased: ${purchasedTitles.join(', ')}`,
    409
  );
}

export function calculateCheckoutTotals(items: CheckoutCartItem[]) {
  const subtotalAmountCents = items.reduce(
    (total, item) => total + item.unitAmountCents * item.quantity,
    0
  );
  const discountAmountCents = 0;
  const taxAmountCents = 0;

  return {
    subtotalAmountCents,
    discountAmountCents,
    taxAmountCents,
    totalAmountCents: subtotalAmountCents - discountAmountCents + taxAmountCents
  };
}

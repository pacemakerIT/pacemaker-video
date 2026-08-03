import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { Mock } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn()
  },
  cart: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn()
  },
  favorite: {
    findMany: vi.fn(),
    deleteMany: vi.fn()
  },
  $transaction: vi.fn(),
  video: {
    findUnique: vi.fn()
  }
}));

const transaction = {
  cart: {
    create: vi.fn()
  },
  favorite: {
    upsert: vi.fn()
  },
  video: {
    findUnique: vi.fn()
  }
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

const { auth } = await import('@clerk/nextjs/server');
const {
  GET: cartGet,
  POST: cartPost,
  DELETE: cartDelete
} = await import('./cart/route');
const {
  GET: favoritesGet,
  POST: favoritesPost,
  DELETE: favoritesDelete
} = await import('./favorites/route');
const { GET: interestGet, PUT: interestPut } = await import('./interest/route');

type GetHandler = (request: NextRequest) => Promise<Response>;

const getCart = cartGet as GetHandler;
const getFavorites = favoritesGet as GetHandler;
const getInterest = interestGet as GetHandler;
const postCart = cartPost as GetHandler;
const deleteCart = cartDelete as GetHandler;
const postFavorite = favoritesPost as GetHandler;
const deleteFavorite = favoritesDelete as GetHandler;
const putInterest = interestPut as GetHandler;

const clerkUserId = 'clerk-user-1';
const applicationUserId = '11111111-1111-4111-8111-111111111111';
const anotherUserId = '22222222-2222-4222-8222-222222222222';

function request(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

function jsonRequest(path: string, method: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

function malformedJsonRequest(path: string, method: string) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  });
}

describe('personal-data API ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth as unknown as Mock).mockResolvedValue({ userId: clerkUserId });
    prismaMock.user.findUnique.mockResolvedValue({ id: applicationUserId });
    prismaMock.cart.findMany.mockResolvedValue([]);
    prismaMock.favorite.findMany.mockResolvedValue([]);
    prismaMock.cart.findFirst.mockResolvedValue(null);
    prismaMock.cart.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.favorite.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.video.findUnique.mockResolvedValue({
      id: 'video-db-id',
      title: 'Video',
      price: '1',
      description: 'Description',
      category: null
    });
    transaction.cart.create.mockResolvedValue({
      itemId: 'video-id',
      itemType: 'VIDEO'
    });
    transaction.favorite.upsert.mockResolvedValue({
      itemId: 'video-id',
      itemType: 'VIDEO'
    });
    transaction.video.findUnique.mockResolvedValue({
      id: 'video-db-id',
      title: 'Video',
      price: '1',
      description: 'Description',
      category: null
    });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(transaction)
    );
  });

  it.each([
    ['cart', getCart, '/api/cart?userId=' + anotherUserId],
    ['favorites', getFavorites, '/api/favorites?userId=' + anotherUserId]
  ])(
    'uses the authenticated application user for %s, not client userId',
    async (_name, handler, path) => {
      const response = await handler(request(path));

      expect(response.status).toBe(200);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: clerkUserId },
        select: { id: true }
      });
    }
  );

  it('uses the authenticated application user for cart data', async () => {
    await getCart(request(`/api/cart?userId=${anotherUserId}`));

    expect(prismaMock.cart.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: applicationUserId } })
    );
  });

  it('uses the authenticated application user for favorite data', async () => {
    await getFavorites(request(`/api/favorites?userId=${anotherUserId}`));

    expect(prismaMock.favorite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: applicationUserId } })
    );
  });

  it('uses the authenticated application user for interests', async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: applicationUserId })
      .mockResolvedValueOnce({ interest: ['IT'] });

    const response = await getInterest(
      request(`/api/interest?userId=${anotherUserId}`)
    );

    expect(response.status).toBe(200);
    expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
      where: { id: applicationUserId },
      select: { interest: true }
    });
  });

  it('uses the authenticated application user when adding a cart item', async () => {
    const response = await postCart(
      jsonRequest('/api/cart', 'POST', {
        userId: anotherUserId,
        itemId: 'video-id',
        itemType: 'VIDEO'
      })
    );

    expect(response.status).toBe(200);
    expect(prismaMock.cart.findFirst).toHaveBeenCalledWith({
      where: {
        userId: applicationUserId,
        itemId: 'video-id',
        itemType: 'VIDEO'
      }
    });
    expect(transaction.cart.create).toHaveBeenCalledWith({
      data: {
        userId: applicationUserId,
        itemId: 'video-id',
        itemType: 'VIDEO'
      }
    });
  });

  it('uses the authenticated application user when deleting cart items', async () => {
    const response = await deleteCart(
      jsonRequest(`/api/cart?userId=${anotherUserId}`, 'DELETE', {
        itemIds: ['video-id']
      })
    );

    expect(response.status).toBe(200);
    expect(prismaMock.cart.deleteMany).toHaveBeenCalledWith({
      where: { userId: applicationUserId, itemId: { in: ['video-id'] } }
    });
  });

  it('does not create a duplicate cart item', async () => {
    prismaMock.cart.findFirst.mockResolvedValue({ id: 'existing-cart-item' });

    const response = await postCart(
      jsonRequest('/api/cart', 'POST', {
        itemId: 'video-id',
        itemType: 'VIDEO'
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: 'Item already exists in cart'
    });
    expect(transaction.cart.create).not.toHaveBeenCalled();
  });

  it('uses the authenticated application user when adding a favorite', async () => {
    const response = await postFavorite(
      jsonRequest('/api/favorites', 'POST', {
        userId: anotherUserId,
        itemId: 'video-id',
        itemType: 'VIDEO'
      })
    );

    expect(response.status).toBe(200);
    expect(transaction.favorite.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
          userId: applicationUserId,
          itemId: 'video-id',
          itemType: 'VIDEO'
        }
      })
    );
  });

  it('uses the authenticated application user when deleting a favorite', async () => {
    const response = await deleteFavorite(
      request(
        `/api/favorites?userId=${anotherUserId}&itemId=video-id&itemType=VIDEO`
      )
    );

    expect(response.status).toBe(200);
    expect(prismaMock.favorite.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: applicationUserId,
        itemId: 'video-id',
        itemType: 'VIDEO'
      }
    });
  });

  it('uses the authenticated application user when updating interests', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: applicationUserId });
    prismaMock.user.update.mockResolvedValue({
      id: applicationUserId,
      interest: ['IT']
    });

    const response = await putInterest(
      jsonRequest('/api/interest', 'PUT', {
        userId: anotherUserId,
        interests: ['IT']
      })
    );

    expect(response.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: applicationUserId },
      data: { interest: ['IT'] },
      select: { id: true, interest: true }
    });
  });

  it.each([
    ['cart POST', postCart, jsonRequest('/api/cart', 'POST', {})],
    ['cart DELETE', deleteCart, jsonRequest('/api/cart', 'DELETE', {})],
    ['favorites POST', postFavorite, jsonRequest('/api/favorites', 'POST', {})],
    ['favorites DELETE', deleteFavorite, request('/api/favorites')],
    ['interest PUT', putInterest, jsonRequest('/api/interest', 'PUT', {})]
  ])('returns 400 for invalid %s input', async (_name, handler, req) => {
    const response = await handler(req);

    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
  });

  it.each([
    ['cart POST', postCart, jsonRequest('/api/cart', 'POST', {})],
    ['cart DELETE', deleteCart, jsonRequest('/api/cart', 'DELETE', {})],
    ['favorites POST', postFavorite, jsonRequest('/api/favorites', 'POST', {})],
    ['favorites DELETE', deleteFavorite, request('/api/favorites')],
    ['interest PUT', putInterest, jsonRequest('/api/interest', 'PUT', {})]
  ])(
    'returns 401 before parsing an unauthenticated %s request',
    async (_name, handler, req) => {
      (auth as unknown as Mock).mockResolvedValue({ userId: null });

      const response = await handler(req);

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    }
  );

  it.each([
    ['cart', getCart, '/api/cart'],
    ['favorites', getFavorites, '/api/favorites'],
    ['interest', getInterest, '/api/interest']
  ])(
    'returns 401 for an unauthenticated %s request',
    async (_name, handler, path) => {
      (auth as unknown as Mock).mockResolvedValue({ userId: null });

      const response = await handler(request(path));

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    }
  );

  it.each([
    ['cart', getCart, request('/api/cart')],
    ['favorites', getFavorites, request('/api/favorites')],
    ['interest', getInterest, request('/api/interest')],
    ['cart POST', postCart, jsonRequest('/api/cart', 'POST', {})],
    ['cart DELETE', deleteCart, jsonRequest('/api/cart', 'DELETE', {})],
    ['favorites POST', postFavorite, jsonRequest('/api/favorites', 'POST', {})],
    ['favorites DELETE', deleteFavorite, request('/api/favorites')],
    ['interest PUT', putInterest, jsonRequest('/api/interest', 'PUT', {})]
  ])(
    'returns 404 when the authenticated %s user has no application record',
    async (_name, handler, req) => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await handler(req);

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({
        error: 'User not found'
      });
    }
  );

  it.each([
    [
      'cart POST',
      postCart,
      jsonRequest('/api/cart', 'POST', {
        itemId: 'video-id',
        itemType: 'INVALID'
      })
    ],
    [
      'favorites DELETE',
      deleteFavorite,
      request('/api/favorites?itemId=video-id&itemType=INVALID')
    ],
    [
      'interest PUT',
      putInterest,
      jsonRequest('/api/interest', 'PUT', { interests: ['INVALID'] })
    ]
  ])('returns 400 for an invalid enum in %s', async (_name, handler, req) => {
    const response = await handler(req);

    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
  });

  it.each([
    ['cart POST', postCart, malformedJsonRequest('/api/cart', 'POST')],
    [
      'favorites POST',
      postFavorite,
      malformedJsonRequest('/api/favorites', 'POST')
    ],
    ['interest PUT', putInterest, malformedJsonRequest('/api/interest', 'PUT')]
  ])('returns 400 for malformed JSON in %s', async (_name, handler, req) => {
    const response = await handler(req);

    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
  });

  it('returns a generic 500 response when a cart query fails', async () => {
    prismaMock.cart.findMany.mockRejectedValue(new Error('database details'));

    const response = await getCart(request('/api/cart'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch cart'
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn()
}));

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn()
  }
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

const { auth, currentUser } = await import('@clerk/nextjs/server');
const { GET } = await import('./route');

describe('GET /api/user', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    vi.mocked(currentUser).mockResolvedValue(null as never);
  });

  it('rejects unauthenticated requests', async () => {
    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns the existing application user', async () => {
    const existingUser = { id: 'user-id', clerkId: 'clerk-user-id' };
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-id' } as never);
    prismaMock.user.findUnique.mockResolvedValue(existingUser);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(existingUser);
    expect(currentUser).not.toHaveBeenCalled();
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('provisions an application user when the Clerk webhook has not arrived yet', async () => {
    const provisionedUser = {
      id: 'user-id',
      clerkId: 'clerk-user-id',
      email: 'new-user@example.com',
      name: 'New User'
    };
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-id' } as never);
    prismaMock.user.findUnique.mockResolvedValue(null);
    vi.mocked(currentUser).mockResolvedValue({
      firstName: 'New',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'new-user@example.com' },
      emailAddresses: [{ emailAddress: 'new-user@example.com' }],
      unsafeMetadata: {}
    } as never);
    prismaMock.user.upsert.mockResolvedValue(provisionedUser);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(provisionedUser);
    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { email: 'new-user@example.com' },
      create: expect.objectContaining({
        clerkId: 'clerk-user-id',
        email: 'new-user@example.com',
        name: 'New User'
      }),
      update: {
        clerkId: 'clerk-user-id',
        name: 'New User'
      }
    });
  });

  it('uses custom email sign-up metadata when Clerk profile names are unavailable', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-id' } as never);
    prismaMock.user.findUnique.mockResolvedValue(null);
    vi.mocked(currentUser).mockResolvedValue({
      firstName: null,
      lastName: null,
      primaryEmailAddress: { emailAddress: 'new-user@example.com' },
      emailAddresses: [{ emailAddress: 'new-user@example.com' }],
      unsafeMetadata: { firstName: 'Email', lastName: 'User' }
    } as never);
    prismaMock.user.upsert.mockResolvedValue({ id: 'user-id' });

    await GET();

    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { email: 'new-user@example.com' },
      create: expect.objectContaining({ name: 'Email User' }),
      update: {
        clerkId: 'clerk-user-id',
        name: 'Email User'
      }
    });
  });

  it('does not create a database user when Clerk user details are unavailable', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-id' } as never);
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: 'Unable to provision the authenticated user.'
    });
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('returns the same Clerk user created by a concurrent request', async () => {
    const user = { id: 'user-id', clerkId: 'clerk-user-id' };
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-id' } as never);
    vi.mocked(currentUser).mockResolvedValue({
      primaryEmailAddress: { emailAddress: 'new-user@example.com' },
      unsafeMetadata: {}
    } as never);
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user);
    prismaMock.user.upsert.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] }
      })
    );

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(user);
    expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
      where: { clerkId: 'clerk-user-id' }
    });
  });

  it('reports an email conflict without relinking another account', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-id' } as never);
    vi.mocked(currentUser).mockResolvedValue({
      primaryEmailAddress: { emailAddress: 'existing@example.com' },
      unsafeMetadata: {}
    } as never);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.upsert.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] }
      })
    );

    const response = await GET();

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      code: 'ACCOUNT_LINK_CONFLICT'
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
      where: { clerkId: 'clerk-user-id' }
    });
  });

  it('does not expose database errors in the response', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-user-id' } as never);
    prismaMock.user.findUnique.mockRejectedValue(new Error('database details'));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Unable to load your account. Please try again.'
    });
  });
});

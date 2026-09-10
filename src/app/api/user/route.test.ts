import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    vi.clearAllMocks();
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
      where: { clerkId: 'clerk-user-id' },
      create: expect.objectContaining({
        clerkId: 'clerk-user-id',
        email: 'new-user@example.com',
        name: 'New User'
      }),
      update: {}
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
      where: { clerkId: 'clerk-user-id' },
      create: expect.objectContaining({ name: 'Email User' }),
      update: {}
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
});

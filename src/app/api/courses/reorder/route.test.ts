import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

const prismaMock = {
  user: {
    findUnique: vi.fn()
  },
  $executeRaw: vi.fn()
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}));

const revalidatePath = vi.fn();
vi.mock('next/cache', () => ({ revalidatePath }));

const { auth } = await import('@clerk/nextjs/server');
const { PATCH } = await import('./route');

const courseId = '550e8400-e29b-41d4-a716-446655440000';

function request(body: unknown) {
  return new Request('http://localhost/api/courses/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

describe('PATCH /api/courses/reorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.$executeRaw.mockResolvedValue(1);
  });

  it('rejects unauthenticated requests before parsing the body', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/courses/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: '{'
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects non-admin requests before changing order', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'USER' });

    const response = await PATCH(
      request({ items: [{ id: courseId, orderKey: 'a0' }] })
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns 400 instead of 500 for malformed admin reorder JSON', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });

    const response = await PATCH(
      new Request('http://localhost/api/courses/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: '{'
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid data' });
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    { items: [] },
    { items: [{ id: 'not-a-uuid', orderKey: 'a0' }] },
    { items: [{ id: courseId, orderKey: '   ' }] },
    {
      items: [
        { id: courseId, orderKey: 'a0' },
        { id: courseId, orderKey: 'a1' }
      ]
    },
    null
  ])('rejects invalid reorder data: %j', async (body) => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });

    const response = await PATCH(request(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid data' });
    expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('updates order and revalidates affected pages for an admin', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_admin_123' } as never);
    prismaMock.user.findUnique.mockResolvedValue({ roleId: 'ADMIN' });

    const response = await PATCH(
      request({ items: [{ id: courseId, orderKey: 'a0' }] })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'Order updated' });
    expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/courses');
    expect(revalidatePath).toHaveBeenCalledWith('/courses');
  });
});

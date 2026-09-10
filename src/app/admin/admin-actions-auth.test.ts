import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn()
}));

vi.mock('@/lib/admin-auth', () => ({
  requireAdminUser: mocks.requireAdminUser
}));

vi.mock('@/lib/prisma', () => ({ default: {} }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import { getUsers } from './users/actions';
import { getEbooks } from '@/components/admin/ebooks/actions/ebook-actions';

describe('admin server actions', () => {
  it.each([
    [{ ok: false, status: 401, error: 'Unauthorized' }],
    [{ ok: false, status: 403, error: 'Forbidden' }]
  ])('rejects admin actions without access: %o', async (adminAccess) => {
    mocks.requireAdminUser.mockResolvedValue(adminAccess);

    await expect(getUsers()).rejects.toThrow(adminAccess.error);
    await expect(getEbooks()).rejects.toThrow(adminAccess.error);
  });
});

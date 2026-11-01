import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminAccessForClerkUserId: vi.fn(),
  verifyMcpApiAccessToken: vi.fn(),
  findMany: vi.fn()
}));

vi.mock('@/lib/admin-auth', () => ({
  getAdminAccessForClerkUserId: mocks.getAdminAccessForClerkUserId
}));
vi.mock('@/lib/mcp-api-token', () => ({
  MCP_MAIN_VISUAL_READ_SCOPE: 'mcp:main-visual:read',
  verifyMcpApiAccessToken: mocks.verifyMcpApiAccessToken
}));
vi.mock('@/lib/prisma', () => ({
  default: { mainVisual: { findMany: mocks.findMany } }
}));

import { GET } from '@/app/api/mcp/main-visual/route';

describe('GET /api/mcp/main-visual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyMcpApiAccessToken.mockResolvedValue({
      subject: 'user_admin',
      clientId: 'approved-client',
      scopes: ['mcp:main-visual:read']
    });
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({ ok: true });
    mocks.findMany.mockResolvedValue([
      { id: 'visual_1', title: 'Spring', isPublic: true, orderIndex: 0 }
    ]);
  });

  it('requires an Authorization Bearer token', async () => {
    const response = await GET(
      new Request('http://localhost/api/mcp/main-visual')
    );

    expect(response.status).toBe(401);
    expect(mocks.verifyMcpApiAccessToken).not.toHaveBeenCalled();
  });

  it('rejects invalid API tokens', async () => {
    mocks.verifyMcpApiAccessToken.mockRejectedValue(new Error('invalid token'));

    const response = await GET(
      new Request('http://localhost/api/mcp/main-visual', {
        headers: { authorization: 'Bearer invalid-token' }
      })
    );

    expect(response.status).toBe(401);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it('rechecks the current admin role for each data request', async () => {
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({
      ok: false,
      status: 403,
      error: 'Forbidden'
    });

    const response = await GET(
      new Request('http://localhost/api/mcp/main-visual', {
        headers: { authorization: 'Bearer valid-api-token' }
      })
    );

    expect(response.status).toBe(403);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it('returns only the allowed MainVisual fields to a currently authorized admin', async () => {
    const response = await GET(
      new Request('http://localhost/api/mcp/main-visual', {
        headers: { authorization: 'Bearer valid-api-token' }
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { id: 'visual_1', title: 'Spring', isPublic: true, orderIndex: 0 }
    ]);
    expect(mocks.getAdminAccessForClerkUserId).toHaveBeenCalledWith(
      'user_admin'
    );
    expect(mocks.findMany).toHaveBeenCalledWith({
      orderBy: { orderIndex: 'asc' },
      select: { id: true, title: true, isPublic: true, orderIndex: true }
    });
  });
});

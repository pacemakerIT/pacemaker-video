import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminAccessForClerkUserId: vi.fn(),
  verifyMcpApiAccessToken: vi.fn(),
  findUnique: vi.fn()
}));

vi.mock('@/lib/admin-auth', () => ({
  getAdminAccessForClerkUserId: mocks.getAdminAccessForClerkUserId
}));
vi.mock('@/lib/mcp-api-token', () => ({
  MCP_MAIN_VISUAL_READ_SCOPE: 'mcp:main-visual:read',
  verifyMcpApiAccessToken: mocks.verifyMcpApiAccessToken
}));
vi.mock('@/lib/prisma', () => ({
  default: { mainVisual: { findUnique: mocks.findUnique } }
}));

import { GET } from '@/app/api/mcp/main-visual/[id]/route';
import { McpScopeError } from '@/lib/mcp-scope-error';

const VISUAL_ID = '0b9f8a52-3c4d-4e5f-8a6b-7c8d9e0f1a2b';

function request(id: string, token?: string) {
  return GET(
    new Request(`http://localhost/api/mcp/main-visual/${id}`, {
      headers: token ? { authorization: `Bearer ${token}` } : {}
    }),
    { params: Promise.resolve({ id }) }
  );
}

describe('GET /api/mcp/main-visual/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyMcpApiAccessToken.mockResolvedValue({
      subject: 'user_admin',
      clientId: 'approved-client',
      scopes: ['mcp:main-visual:read']
    });
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({ ok: true });
    mocks.findUnique.mockResolvedValue({
      id: VISUAL_ID,
      title: 'Spring',
      description: 'Spring cohort',
      linkName: 'Apply now',
      link: '/courses',
      isPublic: true,
      orderIndex: 0
    });
  });

  it('requires an Authorization Bearer token', async () => {
    const response = await request(VISUAL_ID);

    expect(response.status).toBe(401);
    expect(mocks.verifyMcpApiAccessToken).not.toHaveBeenCalled();
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('rejects invalid API tokens', async () => {
    mocks.verifyMcpApiAccessToken.mockRejectedValue(new Error('invalid token'));

    const response = await request(VISUAL_ID, 'invalid-token');

    expect(response.status).toBe(401);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('answers 403 insufficient_scope for a token without the scope', async () => {
    mocks.verifyMcpApiAccessToken.mockRejectedValue(
      new McpScopeError('mcp:main-visual:read')
    );

    const response = await request(VISUAL_ID, 'read-less-token');

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'insufficient_scope' });
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('rechecks the current admin role before reading', async () => {
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({
      ok: false,
      status: 403,
      error: 'Forbidden'
    });

    const response = await request(VISUAL_ID, 'valid-api-token');

    expect(response.status).toBe(403);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('authenticates before validating the id', async () => {
    const response = await request('not-a-uuid');

    expect(response.status).toBe(401);
  });

  it('rejects an id that is not a UUID', async () => {
    const response = await request('not-a-uuid', 'valid-api-token');

    expect(response.status).toBe(400);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 when the main visual does not exist', async () => {
    mocks.findUnique.mockResolvedValue(null);

    const response = await request(VISUAL_ID, 'valid-api-token');

    expect(response.status).toBe(404);
  });

  it('returns only the allowed MainVisual fields', async () => {
    const response = await request(VISUAL_ID, 'valid-api-token');

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      id: VISUAL_ID,
      title: 'Spring',
      description: 'Spring cohort',
      linkName: 'Apply now',
      link: '/courses',
      isPublic: true,
      orderIndex: 0
    });
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: VISUAL_ID },
      select: {
        id: true,
        title: true,
        description: true,
        linkName: true,
        link: true,
        isPublic: true,
        orderIndex: true
      }
    });
  });
});

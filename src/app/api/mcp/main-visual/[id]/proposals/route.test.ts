import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminAccessForClerkUserId: vi.fn(),
  verifyMcpApiAccessToken: vi.fn(),
  findUnique: vi.fn()
}));

vi.mock('@/lib/admin-auth', () => ({
  getAdminAccessForClerkUserId: mocks.getAdminAccessForClerkUserId
}));
vi.mock('@/lib/mcp-api-token', () => ({
  MCP_MAIN_VISUAL_WRITE_SCOPE: 'mcp:main-visual:write',
  verifyMcpApiAccessToken: mocks.verifyMcpApiAccessToken
}));
vi.mock('@/lib/prisma', () => ({
  default: { mainVisual: { findUnique: mocks.findUnique } }
}));

import { POST } from '@/app/api/mcp/main-visual/[id]/proposals/route';
import { verifyMainVisualChangeToken } from '@/lib/mcp-main-visual-change';

const VISUAL_ID = '0b9f8a52-3c4d-4e5f-8a6b-7c8d9e0f1a2b';
const UPDATED_AT = new Date('2026-11-03T15:24:04.757Z');

function request(body: unknown, id = VISUAL_ID, token = 'api-token') {
  return POST(
    new Request(`http://localhost:3000/api/mcp/main-visual/${id}/proposals`, {
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(body)
    }),
    { params: Promise.resolve({ id }) }
  );
}

describe('POST /api/mcp/main-visual/[id]/proposals', () => {
  beforeAll(() => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('MCP_API_JWT_PRIVATE_KEY', '');
    vi.stubEnv('MCP_API_JWT_PUBLIC_KEY', '');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyMcpApiAccessToken.mockResolvedValue({
      subject: 'user_admin',
      clientId: 'approved-client',
      scopes: ['mcp:main-visual:read', 'mcp:main-visual:write']
    });
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({ ok: true });
    mocks.findUnique.mockResolvedValue({
      id: VISUAL_ID,
      title: 'Old title',
      description: 'Old description',
      linkName: 'Browse courses',
      link: '/courses',
      isPublic: true,
      orderIndex: 0,
      updatedAt: UPDATED_AT
    });
  });

  it('requires the write scope', async () => {
    mocks.verifyMcpApiAccessToken.mockRejectedValue(new Error('missing scope'));

    const response = await request({ changes: { title: 'New' } });

    expect(response.status).toBe(401);
    expect(mocks.verifyMcpApiAccessToken).toHaveBeenCalledWith(
      'api-token',
      'mcp:main-visual:write'
    );
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('rechecks the admin role', async () => {
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({
      ok: false,
      status: 403,
      error: 'Forbidden'
    });

    const response = await request({ changes: { title: 'New' } });

    expect(response.status).toBe(403);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('rejects invalid changes before reading the banner', async () => {
    const response = await request({ changes: { link: 'https://evil.test' } });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/path on this site/);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a change that changes nothing', async () => {
    const response = await request({ changes: { title: 'Old title' } });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/Nothing to change/);
  });

  it('returns 404 for a missing banner', async () => {
    mocks.findUnique.mockResolvedValue(null);

    const response = await request({ changes: { title: 'New' } });

    expect(response.status).toBe(404);
  });

  it('previews the change with apply and preview tokens', async () => {
    const response = await request({
      changes: { title: '  New title ', isPublic: true }
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body.before).toEqual({ title: 'Old title' });
    expect(body.after).toEqual({ title: 'New title' });
    expect(body.mainVisual).toEqual({ id: VISUAL_ID, orderIndex: 0 });

    const expectedClaims = {
      subject: 'user_admin',
      clientId: 'approved-client',
      mainVisualId: VISUAL_ID,
      changes: { title: 'New title' },
      baseUpdatedAt: UPDATED_AT.toISOString()
    };
    await expect(
      verifyMainVisualChangeToken(body.changeToken, 'apply')
    ).resolves.toEqual(expectedClaims);

    const previewUrl = new URL(body.previewUrl);
    expect(previewUrl.origin).toBe('http://localhost:3000');
    const previewToken = previewUrl.pathname.replace(
      '/admin/main-visual/preview/',
      ''
    );
    await expect(
      verifyMainVisualChangeToken(previewToken, 'preview')
    ).resolves.toEqual({
      mainVisualId: VISUAL_ID,
      changes: { title: 'New title' },
      baseUpdatedAt: UPDATED_AT.toISOString()
    });
  });
});

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getAdminAccessForClerkUserId: vi.fn(),
  signMcpApiAccessToken: vi.fn()
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/lib/admin-auth', () => ({
  getAdminAccessForClerkUserId: mocks.getAdminAccessForClerkUserId
}));
vi.mock('@/lib/mcp-api-token', () => ({
  MCP_MAIN_VISUAL_READ_SCOPE: 'mcp:main-visual:read',
  signMcpApiAccessToken: mocks.signMcpApiAccessToken
}));

import { POST } from '@/app/api/mcp/token/route';

const originalOAuthClientId = process.env.MCP_OAUTH_CLIENT_ID;

afterAll(() => {
  if (originalOAuthClientId === undefined)
    delete process.env.MCP_OAUTH_CLIENT_ID;
  else process.env.MCP_OAUTH_CLIENT_ID = originalOAuthClientId;
});

describe('POST /api/mcp/token', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MCP_OAUTH_CLIENT_ID = 'approved-client';
    mocks.auth.mockResolvedValue({
      isAuthenticated: true,
      tokenType: 'oauth_token',
      userId: 'user_admin',
      clientId: 'approved-client',
      scopes: ['openid', 'mcp:main-visual:read']
    });
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({ ok: true });
    mocks.signMcpApiAccessToken.mockResolvedValue('signed-api-token');
  });

  it('issues an API token only after Clerk, client, scope, and admin checks', async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      access_token: 'signed-api-token',
      token_type: 'Bearer',
      expires_in: 300,
      scope: 'mcp:main-visual:read'
    });
    expect(mocks.auth).toHaveBeenCalledWith({ acceptsToken: 'oauth_token' });
    expect(mocks.getAdminAccessForClerkUserId).toHaveBeenCalledWith(
      'user_admin'
    );
    expect(mocks.signMcpApiAccessToken).toHaveBeenCalledWith({
      subject: 'user_admin',
      clientId: 'approved-client',
      scopes: ['mcp:main-visual:read']
    });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects unauthenticated or non-OAuth requests', async () => {
    mocks.auth.mockResolvedValue({ isAuthenticated: false, tokenType: null });

    const response = await POST();

    expect(response.status).toBe(401);
    expect(mocks.signMcpApiAccessToken).not.toHaveBeenCalled();
  });

  it('rejects a different OAuth client', async () => {
    mocks.auth.mockResolvedValue({
      isAuthenticated: true,
      tokenType: 'oauth_token',
      userId: 'user_admin',
      clientId: 'unapproved-client',
      scopes: ['mcp:main-visual:read']
    });

    const response = await POST();

    expect(response.status).toBe(403);
    expect(mocks.signMcpApiAccessToken).not.toHaveBeenCalled();
  });

  it('rejects a token without the MainVisual read scope', async () => {
    mocks.auth.mockResolvedValue({
      isAuthenticated: true,
      tokenType: 'oauth_token',
      userId: 'user_admin',
      clientId: 'approved-client',
      scopes: ['openid', 'offline_access']
    });

    const response = await POST();

    expect(response.status).toBe(403);
    expect(mocks.signMcpApiAccessToken).not.toHaveBeenCalled();
  });

  it('rejects a non-admin user', async () => {
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({
      ok: false,
      status: 403,
      error: 'Forbidden'
    });

    const response = await POST();

    expect(response.status).toBe(403);
    expect(mocks.signMcpApiAccessToken).not.toHaveBeenCalled();
  });
});

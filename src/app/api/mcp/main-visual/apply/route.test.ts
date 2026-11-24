import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminAccessForClerkUserId: vi.fn(),
  verifyMcpApiAccessToken: vi.fn(),
  verifyMainVisualChangeToken: vi.fn(),
  findUnique: vi.fn(),
  findUniqueOrThrow: vi.fn(),
  updateMany: vi.fn(),
  createAuditLog: vi.fn(),
  revalidatePath: vi.fn()
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/admin-auth', () => ({
  getAdminAccessForClerkUserId: mocks.getAdminAccessForClerkUserId
}));
vi.mock('@/lib/mcp-api-token', () => ({
  MCP_MAIN_VISUAL_WRITE_SCOPE: 'mcp:main-visual:write',
  verifyMcpApiAccessToken: mocks.verifyMcpApiAccessToken
}));
vi.mock('@/lib/mcp-main-visual-change', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/mcp-main-visual-change')>()),
  verifyMainVisualChangeToken: mocks.verifyMainVisualChangeToken
}));
vi.mock('@/lib/prisma', () => {
  const tx = {
    mainVisual: {
      findUnique: mocks.findUnique,
      findUniqueOrThrow: mocks.findUniqueOrThrow,
      updateMany: mocks.updateMany
    },
    mcpAuditLog: { create: mocks.createAuditLog }
  };
  return {
    default: {
      $transaction: (run: (client: typeof tx) => unknown) => run(tx)
    }
  };
});

import { POST } from '@/app/api/mcp/main-visual/apply/route';

const VISUAL_ID = '0b9f8a52-3c4d-4e5f-8a6b-7c8d9e0f1a2b';
const UPDATED_AT = new Date('2026-11-03T15:24:04.757Z');

const ROW = {
  id: VISUAL_ID,
  title: 'Old title',
  description: 'Old description',
  linkName: 'Browse courses',
  link: '/courses',
  isPublic: true,
  orderIndex: 0,
  updatedAt: UPDATED_AT
};

function request(body: unknown = { changeToken: 'change-token' }) {
  return POST(
    new Request('http://localhost/api/mcp/main-visual/apply', {
      method: 'POST',
      headers: { authorization: 'Bearer api-token' },
      body: JSON.stringify(body)
    })
  );
}

describe('POST /api/mcp/main-visual/apply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyMcpApiAccessToken.mockResolvedValue({
      subject: 'user_admin',
      clientId: 'approved-client',
      scopes: ['mcp:main-visual:read', 'mcp:main-visual:write']
    });
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({ ok: true });
    mocks.verifyMainVisualChangeToken.mockResolvedValue({
      subject: 'user_admin',
      clientId: 'approved-client',
      mainVisualId: VISUAL_ID,
      changes: { title: 'New title' },
      baseUpdatedAt: UPDATED_AT.toISOString()
    });
    mocks.findUnique.mockResolvedValue(ROW);
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.createAuditLog.mockResolvedValue({ id: 'audit-1' });
    mocks.findUniqueOrThrow.mockResolvedValue({
      ...ROW,
      title: 'New title',
      updatedAt: new Date('2026-11-08T10:00:00.000Z')
    });
  });

  it('requires the write scope and an admin', async () => {
    mocks.getAdminAccessForClerkUserId.mockResolvedValue({
      ok: false,
      status: 403,
      error: 'Forbidden'
    });

    const response = await request();

    expect(response.status).toBe(403);
    expect(mocks.verifyMcpApiAccessToken).toHaveBeenCalledWith(
      'api-token',
      'mcp:main-visual:write'
    );
    expect(mocks.verifyMainVisualChangeToken).not.toHaveBeenCalled();
  });

  it('rejects an expired or invalid change token', async () => {
    mocks.verifyMainVisualChangeToken.mockRejectedValue(new Error('expired'));

    const response = await request();

    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/Propose the change again/);
    expect(mocks.verifyMainVisualChangeToken).toHaveBeenCalledWith(
      'change-token',
      'apply'
    );
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a change proposed by another sign-in', async () => {
    mocks.verifyMcpApiAccessToken.mockResolvedValue({
      subject: 'user_other_admin',
      clientId: 'approved-client',
      scopes: ['mcp:main-visual:write']
    });

    const response = await request();

    expect(response.status).toBe(403);
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it('refuses when the banner changed after the preview', async () => {
    mocks.findUnique.mockResolvedValue({
      ...ROW,
      updatedAt: new Date('2026-11-05T00:00:00.000Z')
    });

    const response = await request();

    expect(response.status).toBe(409);
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.createAuditLog).not.toHaveBeenCalled();
  });

  it('refuses when another write wins the race', async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    const response = await request();

    expect(response.status).toBe(409);
    expect(mocks.createAuditLog).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('applies the change, records it and refreshes the home page', async () => {
    const response = await request();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { id: VISUAL_ID, updatedAt: UPDATED_AT },
      data: { title: 'New title' }
    });
    expect(mocks.createAuditLog).toHaveBeenCalledWith({
      data: {
        actorClerkId: 'user_admin',
        clientId: 'approved-client',
        action: 'main_visual.update',
        entityId: VISUAL_ID,
        before: { title: 'Old title' },
        after: { title: 'New title' }
      },
      select: { id: true }
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/');
    expect(body).toMatchObject({
      before: { title: 'Old title' },
      after: { title: 'New title' },
      auditLogId: 'audit-1',
      mainVisual: { id: VISUAL_ID, title: 'New title' }
    });
  });
});

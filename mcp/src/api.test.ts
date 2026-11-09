import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PacemakerApi } from './api.ts';
import type { AuthSession } from './session.ts';
import { routeFetch } from './test-helpers.ts';

const VISUAL_ID = '0b9f8a52-3c4d-4e5f-8a6b-7c8d9e0f1a2b';

function fakeSession() {
  let issued = 0;
  let invalidations = 0;
  const session = {
    async getApiToken() {
      return `api-token-${issued + 1}`;
    },
    invalidateApiToken() {
      invalidations++;
      issued++;
    }
  } as unknown as AuthSession;
  return { session, invalidations: () => invalidations };
}

describe('PacemakerApi', () => {
  it('lists main visuals from the fixed MCP route', async () => {
    const http = routeFetch(() => ({
      status: 200,
      body: [{ id: VISUAL_ID, title: 'Spring', isPublic: true, orderIndex: 0 }]
    }));
    const api = new PacemakerApi({
      origin: 'http://localhost:3000',
      session: fakeSession().session,
      fetchFn: http.fetchFn
    });

    const visuals = await api.listMainVisuals();

    assert.equal(visuals.length, 1);
    assert.equal(
      http.requests[0].url,
      'http://localhost:3000/api/mcp/main-visual'
    );
    assert.equal(http.requests[0].auth, 'Bearer api-token-1');
  });

  it('gets one main visual by id', async () => {
    const http = routeFetch(() => ({
      status: 200,
      body: {
        id: VISUAL_ID,
        title: 'Spring',
        description: null,
        isPublic: false,
        orderIndex: 2
      }
    }));
    const api = new PacemakerApi({
      origin: 'http://localhost:3000',
      session: fakeSession().session,
      fetchFn: http.fetchFn
    });

    const visual = await api.getMainVisual(VISUAL_ID);

    assert.equal(visual.description, null);
    assert.equal(
      http.requests[0].url,
      `http://localhost:3000/api/mcp/main-visual/${VISUAL_ID}`
    );
  });

  it('gets a fresh API token and retries once after a 401', async () => {
    let call = 0;
    const http = routeFetch(() =>
      ++call === 1
        ? { status: 401, body: { error: 'Unauthorized.' } }
        : { status: 200, body: [] }
    );
    const fake = fakeSession();
    const api = new PacemakerApi({
      origin: 'http://localhost:3000',
      session: fake.session,
      fetchFn: http.fetchFn
    });

    assert.deepEqual(await api.listMainVisuals(), []);
    assert.equal(fake.invalidations(), 1);
    assert.equal(http.requests[1].auth, 'Bearer api-token-2');
  });

  it('stops after a second 401', async () => {
    const api = new PacemakerApi({
      origin: 'http://localhost:3000',
      session: fakeSession().session,
      fetchFn: routeFetch(() => ({ status: 401 })).fetchFn
    });

    await assert.rejects(api.listMainVisuals(), /sign_out/);
  });

  it('maps 403, 404 and redirects to clear messages', async () => {
    const make = (status: number, body?: unknown) =>
      new PacemakerApi({
        origin: 'http://localhost:3000',
        session: fakeSession().session,
        fetchFn: routeFetch(() => ({ status, body })).fetchFn
      });

    await assert.rejects(make(403).listMainVisuals(), /admin access/);
    await assert.rejects(
      make(404, { error: 'Main visual not found.' }).getMainVisual(VISUAL_ID),
      /Main visual not found/
    );
    await assert.rejects(make(302).listMainVisuals(), /HTTP 302/);
  });

  it('rejects a response that does not match the expected shape', async () => {
    const api = new PacemakerApi({
      origin: 'http://localhost:3000',
      session: fakeSession().session,
      fetchFn: routeFetch(() => ({ status: 200, body: [{ id: 1 }] })).fetchFn
    });

    await assert.rejects(api.listMainVisuals(), /unexpected response/);
  });
});

describe('PacemakerApi main visual changes', () => {
  const PROPOSAL = {
    mainVisual: { id: VISUAL_ID, orderIndex: 0 },
    before: { title: 'Old' },
    after: { title: 'New' },
    changeToken: 'change-token',
    previewUrl: 'http://localhost:3000/admin/main-visual/preview/preview-token',
    expiresAt: '2026-11-08T10:10:00.000Z'
  };

  function apiWith(http: ReturnType<typeof routeFetch>) {
    return new PacemakerApi({
      origin: 'http://localhost:3000',
      session: fakeSession().session,
      fetchFn: http.fetchFn
    });
  }

  it('posts a proposal to the fixed proposals route', async () => {
    const http = routeFetch(() => ({ status: 200, body: PROPOSAL }));

    const proposal = await apiWith(http).proposeMainVisualChange(VISUAL_ID, {
      title: 'New'
    });

    assert.equal(proposal.changeToken, 'change-token');
    assert.equal(http.requests[0].method, 'POST');
    assert.equal(
      http.requests[0].url,
      `http://localhost:3000/api/mcp/main-visual/${VISUAL_ID}/proposals`
    );
    assert.deepEqual(JSON.parse(http.requests[0].body ?? ''), {
      changes: { title: 'New' }
    });
  });

  it('applies with the change token', async () => {
    const http = routeFetch(() => ({
      status: 200,
      body: {
        mainVisual: {
          id: VISUAL_ID,
          title: 'New',
          description: null,
          linkName: null,
          link: null,
          isPublic: true,
          orderIndex: 0,
          updatedAt: '2026-11-08T10:00:00.000Z'
        },
        before: { title: 'Old' },
        after: { title: 'New' },
        auditLogId: 'audit-1'
      }
    }));

    const applied = await apiWith(http).applyMainVisualChange('change-token');

    assert.equal(applied.auditLogId, 'audit-1');
    assert.equal(
      http.requests[0].url,
      'http://localhost:3000/api/mcp/main-visual/apply'
    );
    assert.deepEqual(JSON.parse(http.requests[0].body ?? ''), {
      changeToken: 'change-token'
    });
  });

  it('asks for a new sign-in when the write scope is missing', async () => {
    const http = routeFetch(() => ({
      status: 403,
      body: { error: 'no scope', code: 'insufficient_scope' }
    }));

    await assert.rejects(
      apiWith(http).proposeMainVisualChange(VISUAL_ID, { title: 'New' }),
      /Run sign_out, then sign in again and allow editing/
    );
  });

  it('passes the stale-preview message through on 409', async () => {
    const http = routeFetch(() => ({
      status: 409,
      body: { error: 'The banner changed after the preview.' }
    }));

    await assert.rejects(
      apiWith(http).applyMainVisualChange('change-token'),
      /changed after the preview/
    );
  });
});

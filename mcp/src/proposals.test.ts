import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ProposalStore } from './proposals.ts';

describe('ProposalStore', () => {
  it('hands out each change token once by a short id', () => {
    const store = new ProposalStore(() => 0);
    const id = store.add('change-token', new Date(60_000));

    assert.match(id, /^[0-9a-f]{8}$/);
    assert.equal(store.take(id), 'change-token');
    assert.equal(store.take(id), null);
  });

  it('drops expired proposals', () => {
    let now = 0;
    const store = new ProposalStore(() => now);
    const id = store.add('change-token', new Date(60_000));

    now = 60_000;
    assert.equal(store.take(id), null);
  });
});

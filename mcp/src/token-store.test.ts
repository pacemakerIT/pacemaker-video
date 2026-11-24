import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createRefreshTokenStore,
  KEYRING_SERVICE,
  keyringAccountFor,
  type KeyringEntry
} from './token-store.ts';

function fakeEntry(fail = false) {
  const calls: string[] = [];
  let value: string | null = null;
  const entry: KeyringEntry = {
    async getPassword() {
      calls.push('get');
      if (fail) throw new Error('locked');
      return value;
    },
    async setPassword(password) {
      calls.push('set');
      if (fail) throw new Error('locked');
      value = password;
    },
    async deletePassword() {
      calls.push('delete');
      if (fail) throw new Error('locked');
      const had = value !== null;
      value = null;
      return had;
    }
  };
  return { entry, calls, read: () => value };
}

describe('createRefreshTokenStore', () => {
  it('uses one OS credential entry per profile and host', () => {
    const accounts: string[] = [];
    const store = createRefreshTokenStore({
      account: keyringAccountFor('development', 'codex'),
      log: () => {},
      createEntry: (service, account) => {
        assert.equal(service, KEYRING_SERVICE);
        accounts.push(account);
        return fakeEntry().entry;
      }
    });

    store.isPersistent();
    assert.deepEqual(accounts, ['development:codex']);
  });

  it('resolves a function account on first use only', async () => {
    const accounts: string[] = [];
    let resolved = 0;
    const store = createRefreshTokenStore({
      account: () => {
        resolved++;
        return keyringAccountFor('development', 'claude-code');
      },
      log: () => {},
      createEntry: (_service, account) => {
        accounts.push(account);
        return fakeEntry().entry;
      }
    });

    assert.deepEqual(accounts, []);
    await store.set('refresh-1');
    await store.get();
    assert.equal(store.isPersistent(), true);
    assert.deepEqual(accounts, ['development:claude-code']);
    assert.equal(resolved, 1);
  });

  it('stores, reads and clears the refresh token in the credential store', async () => {
    const fake = fakeEntry();
    const store = createRefreshTokenStore({
      account: 'development:default',
      log: () => {},
      createEntry: () => fake.entry
    });

    await store.set('refresh-1');
    assert.equal(fake.read(), 'refresh-1');
    assert.equal(await store.get(), 'refresh-1');
    await store.clear();
    assert.equal(await store.get(), null);
    assert.equal(store.isPersistent(), true);
  });

  it('falls back to memory only when the credential store fails', async () => {
    const logs: string[] = [];
    const fake = fakeEntry(true);
    const store = createRefreshTokenStore({
      account: 'development:default',
      log: (message) => logs.push(message),
      createEntry: () => fake.entry
    });

    await store.set('refresh-1');

    assert.equal(store.isPersistent(), false);
    assert.equal(await store.get(), 'refresh-1');
    assert.equal(logs.length, 1);
    assert.ok(!logs[0].includes('refresh-1'));
  });

  it('falls back to memory when no credential backend can be created', async () => {
    const store = createRefreshTokenStore({
      account: 'development:default',
      log: () => {},
      createEntry: () => {
        throw new Error('no backend');
      }
    });

    await store.set('refresh-1');
    assert.equal(await store.get(), 'refresh-1');
    assert.equal(store.isPersistent(), false);
  });
});

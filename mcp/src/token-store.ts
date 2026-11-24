import { AsyncEntry } from '@napi-rs/keyring';

export const KEYRING_SERVICE = 'pacemaker-admin-mcp';

export type KeyringEntry = {
  getPassword(): Promise<string | null>;
  setPassword(password: string): Promise<void>;
  deletePassword(): Promise<boolean>;
};

export type RefreshTokenStore = {
  get(): Promise<string | null>;
  set(refreshToken: string): Promise<void>;
  clear(): Promise<void>;
  isPersistent(): boolean;
};

export type Logger = (message: string) => void;

// Stores only the Clerk refresh token in the OS credential store (macOS
// Keychain, Windows Credential Manager, Linux Secret Service). If the store is
// unavailable it keeps the token in memory only and never falls back to a file.
// A function account is resolved on first use, after the MCP host connects.
export function createRefreshTokenStore(input: {
  account: string | (() => string);
  log: Logger;
  createEntry?: (service: string, account: string) => KeyringEntry;
}): RefreshTokenStore {
  const createEntry =
    input.createEntry ??
    ((service: string, account: string) => new AsyncEntry(service, account));

  let entry: KeyringEntry | null | undefined;
  let memoryToken: string | null = null;

  function getEntry(): KeyringEntry | null {
    if (entry === undefined) {
      const account =
        typeof input.account === 'function' ? input.account() : input.account;
      try {
        entry = createEntry(KEYRING_SERVICE, account);
      } catch {
        entry = null;
      }
    }
    return entry;
  }

  function fallBackToMemory() {
    if (entry) {
      input.log(
        'OS credential store is unavailable; the sign-in will last only until this MCP process exits.'
      );
    }
    entry = null;
  }

  return {
    async get() {
      const current = getEntry();
      if (current) {
        try {
          return await current.getPassword();
        } catch {
          fallBackToMemory();
        }
      }
      return memoryToken;
    },
    async set(refreshToken) {
      memoryToken = refreshToken;
      const current = getEntry();
      if (current) {
        try {
          await current.setPassword(refreshToken);
        } catch {
          fallBackToMemory();
        }
      }
    },
    async clear() {
      memoryToken = null;
      const current = getEntry();
      if (current) {
        try {
          await current.deletePassword();
        } catch {
          fallBackToMemory();
        }
      }
    },
    isPersistent() {
      return getEntry() !== null;
    }
  };
}

export function keyringAccountFor(profile: string, hostId: string): string {
  return `${profile}:${hostId}`;
}

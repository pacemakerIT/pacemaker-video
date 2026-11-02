import { describe, expect, it } from 'vitest';
import {
  MAX_SEED_IMAGE_BYTES,
  createCyclicPicker,
  getDatabaseHost,
  isLocalSeedDatabase,
  maskConnectionString,
  publicObjectUrl,
  selectSeedEbookKeys,
  selectSeedImageKeys
} from './seed-helpers';

// Connection strings are assembled at runtime so secret scanners do not read
// these fake test values as leaked credentials.
const FAKE_PASSWORD = ['not', 'a', 'real', 'password'].join('-');

function dbUrl(user: string, hostAndPath: string, scheme = 'postgresql') {
  return `${scheme}://${user}:${FAKE_PASSWORD}@${hostAndPath}`;
}

describe('isLocalSeedDatabase', () => {
  it('allows the local and Docker development databases', () => {
    for (const url of [
      dbUrl('pacemaker-video', 'localhost:5432/web'),
      dbUrl('pacemaker-video', '127.0.0.1:5432/web'),
      dbUrl('pacemaker-video', '[::1]:5432/web'),
      dbUrl('pacemaker-video', 'LOCALHOST:5432/web?schema=public', 'postgres'),
      dbUrl('pacemaker-video', 'host.docker.internal:5432/web'),
      dbUrl('pacemaker-video', 'pacemaker-dev-postgres:5432/web')
    ]) {
      expect(isLocalSeedDatabase(url)).toBe(true);
    }
  });

  it('refuses Supabase direct and pooler databases', () => {
    for (const url of [
      dbUrl('postgres', 'db.abcdefghijklmnop.supabase.co:5432/postgres'),
      dbUrl(
        'postgres.abcdefghijklmnop',
        'aws-0-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
      ),
      dbUrl(
        'postgres.abcdefghijklmnop',
        'aws-0-ca-central-1.pooler.supabase.com:5432/postgres'
      )
    ]) {
      expect(isLocalSeedDatabase(url)).toBe(false);
    }
  });

  it('refuses any other remote host, not just Supabase', () => {
    for (const url of [
      dbUrl('user', 'prod-db.example.com:5432/app'),
      dbUrl('user', '10.0.0.12:5432/app'),
      // A local-looking word in the path or user must not count.
      dbUrl('localhost', 'prod-db.example.com:5432/localhost')
    ]) {
      expect(isLocalSeedDatabase(url)).toBe(false);
    }
  });

  it('refuses connection strings it cannot read', () => {
    for (const url of [
      '',
      'not a url',
      'postgresql:///web?host=/var/run/postgresql'
    ]) {
      expect(isLocalSeedDatabase(url)).toBe(false);
    }
  });
});

describe('getDatabaseHost and maskConnectionString', () => {
  it('reads the host and hides the password', () => {
    const url = dbUrl('postgres', 'db.abc.supabase.co:5432/postgres');

    expect(getDatabaseHost(url)).toBe('db.abc.supabase.co');
    expect(maskConnectionString(url)).toBe(
      'postgresql://postgres:****@db.abc.supabase.co:5432/postgres'
    );
  });
});

describe('selectSeedImageKeys', () => {
  it('keeps images up to 4MB, sorted, and drops everything else', () => {
    expect(
      selectSeedImageKeys([
        { key: 'b.png', size: 1000 },
        { key: 'a.jpeg', size: MAX_SEED_IMAGE_BYTES },
        { key: 'huge.png', size: MAX_SEED_IMAGE_BYTES + 1 },
        { key: 'empty.png', size: 0 },
        { key: 'doc.pdf', size: 1000 },
        { key: 'c.webp', size: 10 }
      ])
    ).toEqual(['a.jpeg', 'b.png', 'c.webp']);
  });
});

describe('selectSeedEbookKeys', () => {
  it('keeps ebook files, including keys without an extension', () => {
    expect(
      selectSeedEbookKeys([
        { key: 'ebook-2', size: 72067 },
        { key: 'ebook-1', size: 71351 },
        { key: 'folder/', size: 0 },
        { key: 'folder/.emptyFolderPlaceholder', size: 0 },
        { key: '.hidden', size: 10 }
      ])
    ).toEqual(['ebook-1', 'ebook-2']);
  });
});

describe('publicObjectUrl', () => {
  it('builds a Supabase public object URL', () => {
    expect(
      publicObjectUrl('https://project.supabase.co/', 'document', 'ebook-1')
    ).toBe(
      'https://project.supabase.co/storage/v1/object/public/document/ebook-1'
    );
  });
});

describe('createCyclicPicker', () => {
  it('hands out items in order and wraps around', () => {
    const next = createCyclicPicker(['a', 'b']);

    expect([next(), next(), next()]).toEqual(['a', 'b', 'a']);
    expect(createCyclicPicker([])()).toBeUndefined();
  });
});

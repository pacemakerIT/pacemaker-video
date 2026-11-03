import { describe, expect, it } from 'vitest';
import {
  getDatabaseHost,
  isLocalSeedDatabase,
  maskConnectionString,
  publicObjectUrl,
  resolveSeedStorage,
  seedFileUrl,
  seededWorkshopStatus,
  shiftDays,
  workshopDayShift
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

describe('publicObjectUrl', () => {
  it('builds a Supabase public object URL', () => {
    expect(
      publicObjectUrl('https://project.supabase.co/', 'document', 'ebook-1')
    ).toBe(
      'https://project.supabase.co/storage/v1/object/public/document/ebook-1'
    );
  });
});

const SUPABASE_URL = 'https://project.supabase.co';
const devEnv = {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_S3_IMG_BUCKET: 'image-dev',
  SUPABASE_S3_EBOOK_BUCKET: 'document-dev'
};

describe('resolveSeedStorage', () => {
  it('uses the -dev buckets when both are configured', () => {
    expect(resolveSeedStorage(devEnv)).toEqual({
      mode: 'dev',
      supabaseUrl: SUPABASE_URL,
      imageBucket: 'image-dev',
      ebookBucket: 'document-dev'
    });
  });

  it('falls back to local mode for production or missing buckets', () => {
    for (const env of [
      { ...devEnv, SUPABASE_S3_IMG_BUCKET: 'image' },
      { ...devEnv, SUPABASE_S3_EBOOK_BUCKET: undefined },
      { ...devEnv, SUPABASE_S3_EBOOK_BUCKET: 'image-dev' },
      { ...devEnv, NEXT_PUBLIC_SUPABASE_URL: '' }
    ]) {
      expect(resolveSeedStorage(env).mode).toBe('local');
    }
  });

  it('accepts quoted values like the app does', () => {
    expect(
      resolveSeedStorage({ ...devEnv, SUPABASE_S3_IMG_BUCKET: '"image-dev"' })
        .mode
    ).toBe('dev');
  });
});

describe('seedFileUrl', () => {
  it('builds -dev bucket URLs by role and encodes the key', () => {
    const storage = resolveSeedStorage(devEnv);

    expect(seedFileUrl(storage, 'image', 'home/a.png')).toBe(
      `${SUPABASE_URL}/storage/v1/object/public/image-dev/home/a.png`
    );
    expect(seedFileUrl(storage, 'ebook', 'TEST - 1 16:49:24')).toBe(
      `${SUPABASE_URL}/storage/v1/object/public/document-dev/TEST%20-%201%2016%3A49%3A24`
    );
  });

  it('returns null in local mode', () => {
    expect(
      seedFileUrl({ mode: 'local', reason: 'x' }, 'image', 'home/a.png')
    ).toBeNull();
  });
});

describe('workshopDayShift', () => {
  const now = new Date('2026-12-01T12:00:00Z');

  it('moves the latest workshop to a week after now in whole days', () => {
    const dates = [
      new Date('2026-03-16T19:00:00Z'),
      new Date('2026-11-05T19:00:00Z')
    ];
    const shift = workshopDayShift(dates, now);
    const latest = shiftDays(dates[1], shift);

    expect(Number.isInteger(shift)).toBe(true);
    expect(latest.toISOString()).toBe('2026-12-08T19:00:00.000Z');
    expect(shiftDays(dates[0], shift) < now).toBe(true);
  });

  it('returns 0 without workshops', () => {
    expect(workshopDayShift([], now)).toBe(0);
  });
});

describe('seededWorkshopStatus', () => {
  it('completes ended workshops and opens upcoming ones', () => {
    const now = new Date('2026-12-01T12:00:00Z');

    expect(seededWorkshopStatus(new Date('2026-11-30T00:00:00Z'), now)).toBe(
      'COMPLETED'
    );
    expect(seededWorkshopStatus(new Date('2026-12-02T00:00:00Z'), now)).toBe(
      'OPEN'
    );
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ConfigError,
  hostIdFromClientName,
  loadConfig,
  redirectUriFor
} from './config.ts';

const BASE_ENV = {
  PACEMAKER_MCP_CLERK_ISSUER: 'https://example.clerk.accounts.dev',
  PACEMAKER_MCP_OAUTH_CLIENT_ID: 'client_123'
};

describe('loadConfig', () => {
  it('defaults to the development profile and local API', () => {
    const config = loadConfig(BASE_ENV);

    assert.equal(config.profile, 'development');
    assert.equal(config.apiOrigin, 'http://localhost:3000');
    assert.equal(config.hostId, undefined);
    assert.equal(redirectUriFor(config), 'http://127.0.0.1:53134/callback');
  });

  it('needs no settings to reach the Clerk development instance', () => {
    const config = loadConfig({});

    assert.equal(
      config.clerkIssuer,
      'https://flowing-imp-24.clerk.accounts.dev'
    );
    assert.equal(config.oauthClientId, 'fJkMj3Mil3vjq9So');
  });

  it('accepts a loopback API origin override', () => {
    const config = loadConfig({
      ...BASE_ENV,
      PACEMAKER_MCP_API_ORIGIN: 'http://127.0.0.1:3001'
    });

    assert.equal(config.apiOrigin, 'http://127.0.0.1:3001');
  });

  for (const origin of [
    'https://pacemaker.example.com',
    'http://192.168.0.10:3000',
    'http://localhost:3000/api',
    'http://localhost:3000?x=1',
    'http://user:pass@localhost:3000'
  ]) {
    it(`rejects API origin ${origin}`, () => {
      assert.throws(
        () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_API_ORIGIN: origin }),
        ConfigError
      );
    });
  }

  it('rejects an unknown profile', () => {
    assert.throws(
      () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_PROFILE: 'staging' }),
      /"development" or "production"/
    );
  });

  describe('production profile', () => {
    const PRODUCTION_ENV = { PACEMAKER_MCP_PROFILE: 'production' };

    it('needs no settings and uses the fixed production values', () => {
      const config = loadConfig(PRODUCTION_ENV);

      assert.equal(config.profile, 'production');
      assert.equal(config.apiOrigin, 'https://www.paceupcareer.com');
      assert.equal(config.clerkIssuer, 'https://clerk.paceupcareer.com');
      assert.equal(config.oauthClientId, 'v919d0TaD1AGZ3np');
      assert.equal(redirectUriFor(config), 'http://127.0.0.1:53134/callback');
    });

    it('is never chosen without PACEMAKER_MCP_PROFILE=production', () => {
      assert.equal(loadConfig({}).profile, 'development');
      assert.equal(loadConfig({}).apiOrigin, 'http://localhost:3000');
    });

    it('allows repeating a fixed value but rejects changing it', () => {
      assert.equal(
        loadConfig({
          ...PRODUCTION_ENV,
          PACEMAKER_MCP_API_ORIGIN: 'https://www.paceupcareer.com'
        }).apiOrigin,
        'https://www.paceupcareer.com'
      );

      for (const override of [
        { PACEMAKER_MCP_API_ORIGIN: 'https://evil.example.com' },
        { PACEMAKER_MCP_API_ORIGIN: 'http://localhost:3000' },
        { PACEMAKER_MCP_CLERK_ISSUER: 'https://example.clerk.accounts.dev' },
        { PACEMAKER_MCP_OAUTH_CLIENT_ID: 'fJkMj3Mil3vjq9So' }
      ]) {
        assert.throws(
          () => loadConfig({ ...PRODUCTION_ENV, ...override }),
          /cannot be changed in the production profile/
        );
      }
    });

    it('does not take the development defaults', () => {
      const production = loadConfig(PRODUCTION_ENV);
      const development = loadConfig({});

      assert.notEqual(production.apiOrigin, development.apiOrigin);
      assert.notEqual(production.clerkIssuer, development.clerkIssuer);
      assert.notEqual(production.oauthClientId, development.oauthClientId);
    });

    it('still validates the redirect port and host id', () => {
      assert.equal(
        loadConfig({ ...PRODUCTION_ENV, PACEMAKER_MCP_REDIRECT_PORT: '53200' })
          .redirectPort,
        53200
      );
      assert.throws(
        () =>
          loadConfig({ ...PRODUCTION_ENV, PACEMAKER_MCP_REDIRECT_PORT: '80' }),
        ConfigError
      );
      assert.throws(
        () =>
          loadConfig({
            ...PRODUCTION_ENV,
            PACEMAKER_MCP_HOST: 'Claude Desktop'
          }),
        ConfigError
      );
    });
  });

  describe('production profile edge cases', () => {
    const PRODUCTION_ENV = { PACEMAKER_MCP_PROFILE: 'production' };

    it('accepts surrounding spaces in the profile name only', () => {
      assert.equal(
        loadConfig({ PACEMAKER_MCP_PROFILE: '  production  ' }).profile,
        'production'
      );
      for (const profile of ['Production', 'PRODUCTION', 'prod', 'live']) {
        assert.throws(
          () => loadConfig({ PACEMAKER_MCP_PROFILE: profile }),
          /"development" or "production"/,
          profile
        );
      }
    });

    it('treats an empty profile as development, never production', () => {
      assert.equal(
        loadConfig({ PACEMAKER_MCP_PROFILE: '' }).profile,
        'development'
      );
      assert.equal(
        loadConfig({ PACEMAKER_MCP_PROFILE: '   ' }).profile,
        'development'
      );
    });

    it('ignores empty or blank overrides', () => {
      const config = loadConfig({
        ...PRODUCTION_ENV,
        PACEMAKER_MCP_API_ORIGIN: '',
        PACEMAKER_MCP_CLERK_ISSUER: '   ',
        PACEMAKER_MCP_OAUTH_CLIENT_ID: ''
      });

      assert.equal(config.apiOrigin, 'https://www.paceupcareer.com');
      assert.equal(config.clerkIssuer, 'https://clerk.paceupcareer.com');
      assert.equal(config.oauthClientId, 'v919d0TaD1AGZ3np');
    });

    it('accepts the same production origin written differently', () => {
      for (const origin of [
        'https://www.paceupcareer.com/',
        'HTTPS://WWW.PACEUPCAREER.COM',
        ' https://www.paceupcareer.com '
      ]) {
        assert.equal(
          loadConfig({ ...PRODUCTION_ENV, PACEMAKER_MCP_API_ORIGIN: origin })
            .apiOrigin,
          'https://www.paceupcareer.com',
          origin
        );
      }
      assert.equal(
        loadConfig({
          ...PRODUCTION_ENV,
          PACEMAKER_MCP_CLERK_ISSUER: 'https://clerk.paceupcareer.com/'
        }).clerkIssuer,
        'https://clerk.paceupcareer.com'
      );
    });

    for (const origin of [
      'http://www.paceupcareer.com',
      'https://paceupcareer.com',
      'https://www.paceupcareer.com.evil.com',
      'https://www.paceupcareer.com@evil.com',
      'https://evil.com/https://www.paceupcareer.com',
      'https://evil.com?u=https://www.paceupcareer.com',
      'https://www.paceupcareer.com:8443',
      'https://www.paceupcareer.com/api',
      'https://www.paceupcareer.co',
      'https://www.paceupcareer.com\\@evil.com',
      'www.paceupcareer.com'
    ]) {
      it(`rejects look-alike API origin ${origin}`, () => {
        assert.throws(
          () =>
            loadConfig({
              ...PRODUCTION_ENV,
              PACEMAKER_MCP_API_ORIGIN: origin
            }),
          ConfigError
        );
      });
    }

    for (const issuer of [
      'https://clerk.paceupcareer.com.evil.com',
      'https://flowing-imp-24.clerk.accounts.dev',
      'http://clerk.paceupcareer.com',
      'https://clerk.paceupcareer.com/oauth'
    ]) {
      it(`rejects Clerk issuer ${issuer}`, () => {
        assert.throws(
          () =>
            loadConfig({
              ...PRODUCTION_ENV,
              PACEMAKER_MCP_CLERK_ISSUER: issuer
            }),
          ConfigError
        );
      });
    }

    it('rejects client ids that differ only slightly', () => {
      for (const clientId of [
        'v919d0TaD1AGZ3n',
        'v919d0TaD1AGZ3np ',
        'V919D0TAD1AGZ3NP',
        'v919d0TaD1AGZ3npx'
      ]) {
        // The trimmed copy with a trailing space is the same id, the rest are not.
        const same = clientId.trim() === 'v919d0TaD1AGZ3np';
        if (same) {
          assert.equal(
            loadConfig({
              ...PRODUCTION_ENV,
              PACEMAKER_MCP_OAUTH_CLIENT_ID: clientId
            }).oauthClientId,
            'v919d0TaD1AGZ3np'
          );
        } else {
          assert.throws(
            () =>
              loadConfig({
                ...PRODUCTION_ENV,
                PACEMAKER_MCP_OAUTH_CLIENT_ID: clientId
              }),
            ConfigError,
            clientId
          );
        }
      }
    });

    it('rejects out-of-range or fractional redirect ports', () => {
      for (const port of ['1023', '65536', '53134.5', 'abc', '-1', '0']) {
        assert.throws(
          () =>
            loadConfig({
              ...PRODUCTION_ENV,
              PACEMAKER_MCP_REDIRECT_PORT: port
            }),
          ConfigError,
          port
        );
      }
      assert.equal(
        loadConfig({ ...PRODUCTION_ENV, PACEMAKER_MCP_REDIRECT_PORT: '1024' })
          .redirectPort,
        1024
      );
      assert.equal(
        loadConfig({ ...PRODUCTION_ENV, PACEMAKER_MCP_REDIRECT_PORT: '65535' })
          .redirectPort,
        65535
      );
    });

    it('rejects an unsafe host id', () => {
      for (const hostId of ['A', 'a b', '../x', 'a'.repeat(41), 'a:b']) {
        assert.throws(
          () => loadConfig({ ...PRODUCTION_ENV, PACEMAKER_MCP_HOST: hostId }),
          ConfigError,
          hostId
        );
      }
    });
  });

  describe('development profile cannot reach production', () => {
    // A development profile sends the Clerk token to a loopback server. If it
    // could also use the production Clerk instance or OAuth app, a program
    // listening on localhost would receive a production admin token.
    it('rejects the production Clerk issuer', () => {
      for (const issuer of [
        'https://clerk.paceupcareer.com',
        'https://clerk.paceupcareer.com/',
        'HTTPS://CLERK.PACEUPCAREER.COM'
      ]) {
        assert.throws(
          () =>
            loadConfig({
              ...BASE_ENV,
              PACEMAKER_MCP_CLERK_ISSUER: issuer
            }),
          /production/,
          issuer
        );
      }
    });

    it('rejects the production OAuth client id', () => {
      assert.throws(
        () =>
          loadConfig({
            ...BASE_ENV,
            PACEMAKER_MCP_OAUTH_CLIENT_ID: 'v919d0TaD1AGZ3np'
          }),
        /production/
      );
    });

    it('rejects the production API origin', () => {
      assert.throws(
        () =>
          loadConfig({
            ...BASE_ENV,
            PACEMAKER_MCP_API_ORIGIN: 'https://www.paceupcareer.com'
          }),
        ConfigError
      );
    });
  });

  it('requires an https Clerk issuer', () => {
    assert.throws(
      () =>
        loadConfig({
          ...BASE_ENV,
          PACEMAKER_MCP_CLERK_ISSUER: 'http://example.clerk.accounts.dev'
        }),
      /https/
    );
    assert.throws(
      () =>
        loadConfig({
          ...BASE_ENV,
          PACEMAKER_MCP_CLERK_ISSUER: 'https://example.clerk.accounts.dev/x'
        }),
      /origin/
    );
  });

  it('validates the OAuth client id, redirect port and host id', () => {
    assert.throws(
      () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_OAUTH_CLIENT_ID: 'a b' }),
      ConfigError
    );
    assert.throws(
      () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_REDIRECT_PORT: '80' }),
      ConfigError
    );
    assert.throws(
      () => loadConfig({ ...BASE_ENV, PACEMAKER_MCP_HOST: 'Claude Desktop' }),
      ConfigError
    );
    assert.equal(
      loadConfig({ ...BASE_ENV, PACEMAKER_MCP_HOST: 'codex' }).hostId,
      'codex'
    );
  });
});

describe('hostIdFromClientName', () => {
  it('turns the MCP client name into a keyring-safe host id', () => {
    assert.equal(hostIdFromClientName('claude-code'), 'claude-code');
    assert.equal(hostIdFromClientName('codex-mcp-client'), 'codex-mcp-client');
    assert.equal(hostIdFromClientName('Claude Desktop'), 'claude-desktop');
    assert.equal(hostIdFromClientName(' My_App!! '), 'my-app');
    assert.equal(hostIdFromClientName('a'.repeat(39) + ' b'), 'a'.repeat(39));
  });

  it('falls back to "default" without a usable name', () => {
    assert.equal(hostIdFromClientName(undefined), 'default');
    assert.equal(hostIdFromClientName('!!!'), 'default');
  });
});

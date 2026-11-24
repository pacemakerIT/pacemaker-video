#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { PacemakerApi } from './api.ts';
import { hostIdFromClientName, loadConfig } from './config.ts';
import { openBrowser } from './oauth.ts';
import { AuthSession, createClerkOAuthProvider } from './session.ts';
import { createRefreshTokenStore, keyringAccountFor } from './token-store.ts';
import { registerTools } from './tools.ts';

// stdout carries the MCP protocol, so all diagnostics go to stderr.
function log(message: string) {
  process.stderr.write(`[pacemaker-admin-mcp] ${message}\n`);
}

async function main() {
  const config = loadConfig();
  const server = new McpServer({ name: 'pacemaker-admin', version: '0.1.0' });
  // Resolved on first use, after the MCP host has sent its name.
  const store = createRefreshTokenStore({
    account: () => {
      const hostId =
        config.hostId ??
        hostIdFromClientName(server.server.getClientVersion()?.name);
      log(`Using the stored sign-in for host "${hostId}".`);
      return keyringAccountFor(config.profile, hostId);
    },
    log
  });
  const session = new AuthSession({
    config,
    oauth: createClerkOAuthProvider({ config, openBrowser, log }),
    store,
    log
  });
  const api = new PacemakerApi({ origin: config.apiOrigin, session });

  registerTools(server, { api, session, log });

  await server.connect(new StdioServerTransport());
  log(
    `Ready (profile=${config.profile}, host=${config.hostId ?? 'from MCP client'}, api=${config.apiOrigin}).`
  );
}

main().catch((error: unknown) => {
  log(error instanceof Error ? error.message : 'Failed to start.');
  process.exit(1);
});

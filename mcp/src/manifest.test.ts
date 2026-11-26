import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { registerTools } from './tools.ts';

// The Claude Desktop extension (mcpb/manifest.json) lists the tools by hand, so
// this keeps that list and the real server in step.
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, '../mcpb/manifest.json'),
    'utf8'
  )
) as {
  manifest_version: string;
  name: string;
  server: {
    type: string;
    entry_point: string;
    mcp_config: {
      command: string;
      args: string[];
      env: Record<string, string>;
    };
  };
  tools: { name: string; description: string }[];
  compatibility: { platforms: string[] };
};

function registeredToolNames() {
  const names: string[] = [];
  const server = {
    registerTool: (name: string) => {
      names.push(name);
    }
  } as unknown as McpServer;
  registerTools(server, {
    api: {} as never,
    session: {} as never,
    log: () => {}
  });
  return names;
}

describe('Claude Desktop extension manifest', () => {
  it('lists exactly the tools the server registers', () => {
    assert.deepEqual(
      manifest.tools.map((tool) => tool.name).sort(),
      registeredToolNames().sort()
    );
  });

  it('describes every tool', () => {
    for (const tool of manifest.tools) {
      assert.ok(tool.description.trim().length > 0, tool.name);
    }
  });

  it('starts the bundled server with the production profile', () => {
    const { server } = manifest;

    assert.equal(server.type, 'node');
    assert.equal(server.mcp_config.command, 'node');
    assert.deepEqual(server.mcp_config.args, [
      `\${__dirname}/${server.entry_point}`
    ]);
    assert.deepEqual(server.mcp_config.env, {
      PACEMAKER_MCP_PROFILE: 'production'
    });
  });

  it('targets only the platforms the keyring binaries are bundled for', () => {
    assert.deepEqual(manifest.compatibility.platforms.sort(), [
      'darwin',
      'win32'
    ]);
  });
});

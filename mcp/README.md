# Pacemaker Admin MCP (PACE-333 POC)

A local stdio MCP server that lets a Pacemaker admin read and edit home page
main visuals from an MCP host such as Claude Desktop or Codex. It never connects to
the database: it signs the admin in with Clerk (OAuth + PKCE), exchanges the
Clerk token for a five-minute Pacemaker API token at `POST /api/mcp/token`, and
calls only the fixed `/api/mcp/main-visual` routes.

Background and decisions: `docs/admin-local-db-mcp-poc-decisions.md`.

## Tools

| Tool                         | What it does                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `list_main_visuals`          | Lists main visuals in display order (`id`, `title`, `isPublic`, `orderIndex`)                 |
| `get_main_visual`            | Gets one main visual by UUID (adds `description`, `linkName` and `link`)                      |
| `propose_main_visual_update` | Previews a change to `title`, `description`, `linkName`, `link` or `isPublic`; writes nothing |
| `apply_main_visual_update`   | Applies a previewed change after the user confirms                                            |
| `sign_in`                    | Starts a browser sign-in, or reports that the admin is signed in                              |
| `sign_out`                   | Removes the stored sign-in on this computer and revokes it when possible                      |

## How editing works

1. `propose_main_visual_update` validates the change on the server and returns
   a before/after list, a `proposalId`, and a link to
   `/admin/main-visual/preview/...` that draws the change with the home page
   banner component. The preview link needs an admin sign-in in the browser and
   expires in 10 minutes.
2. After the user confirms, `apply_main_visual_update` applies exactly the
   previewed change. The server refuses it if the banner changed after the
   preview, records the change in the `McpAuditLog` table, and refreshes the
   home page. The tool is marked destructive, so hosts ask before running it.
3. To undo, propose the previous values that the apply result lists.

`link` accepts only paths on the site, such as `/courses`; percent-encode
spaces, quotes and non-ASCII characters. Editing needs the
`mcp:main-visual:write` scope; a sign-in made before it was added must sign out
and sign in again.

## How sign-in works

1. The first tool call without a stored sign-in opens the system browser at the
   Clerk consent page and returns immediately with a "sign in, then run the
   request again" message. The MCP process waits in the background (up to five
   minutes) for the redirect to `http://127.0.0.1:<port>/callback`.
2. After consent, only the Clerk **refresh token** is saved, in the OS
   credential store: macOS Keychain, Windows Credential Manager or Linux Secret
   Service (via `@napi-rs/keyring`). Access tokens stay in memory.
3. If no credential store is available, the sign-in is kept in memory only and
   lasts until the MCP process exits. It never falls back to a file.

Each MCP host keeps its own stored sign-in, named after the host (for example
`claude-code` or `codex-mcp-client`), because Clerk rotates refresh tokens on
every refresh and two hosts sharing one token would invalidate each other. Sign
in once per host.

## Try it locally

You need Node.js 22.18 or later, the usual local setup (`npm run dev` with the
seeded database), and a seeded admin account. No extra settings are needed:

- `next dev` falls back to development MCP settings when the `MCP_*` variables
  are missing, including a signing key pair generated in memory at startup.
- The MCP server defaults to the Clerk development instance and its MCP OAuth
  app, whose redirect URI `http://127.0.0.1:53134/callback` is registered.

1. Build the MCP server once (and again after pulling changes):

   ```bash
   cd mcp && npm ci && npm run build
   ```

2. Register it with your MCP host, using the absolute path to this repository.

   Claude Code:

   ```bash
   claude mcp add pacemaker-admin -- node /absolute/path/to/pacemaker-video/mcp/dist/index.js
   ```

   Claude Desktop: edit `claude_desktop_config.json` (macOS:
   `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`) and
   restart Claude Desktop.

   ```json
   {
     "mcpServers": {
       "pacemaker-admin": {
         "command": "node",
         "args": ["/absolute/path/to/pacemaker-video/mcp/dist/index.js"]
       }
     }
   }
   ```

   On Windows, escape backslashes, for example
   `"C:\\Users\\me\\pacemaker-video\\mcp\\dist\\index.js"`.

   Codex: add to `~/.codex/config.toml` (Windows:
   `%USERPROFILE%\.codex\config.toml`).

   ```toml
   [mcp_servers.pacemaker-admin]
   command = "node"
   args = ["/absolute/path/to/pacemaker-video/mcp/dist/index.js"]
   ```

3. Ask the host to list the main visuals. Sign in with the seeded admin account
   in the browser window that opens, then ask again.

Only one host can wait for a browser sign-in at a time, because the callback
port is shared.

## Optional settings

Set these in the host's `env` block only when you need to change a default.

| Variable                        | Default                                       |
| ------------------------------- | --------------------------------------------- |
| `PACEMAKER_MCP_API_ORIGIN`      | `http://localhost:3000` (loopback http only)  |
| `PACEMAKER_MCP_HOST`            | Name the MCP host sends when it connects      |
| `PACEMAKER_MCP_CLERK_ISSUER`    | Clerk development instance                    |
| `PACEMAKER_MCP_OAUTH_CLIENT_ID` | Development MCP OAuth app (public, no secret) |
| `PACEMAKER_MCP_REDIRECT_PORT`   | `53134`; must match a registered redirect URI |
| `PACEMAKER_MCP_PROFILE`         | `development`, the only enabled profile       |

## Development

```bash
cd mcp
npm run typecheck
npm test
```

Tests use the Node.js built-in test runner and run the TypeScript sources
directly. Diagnostics go to stderr, because stdout carries the MCP protocol.

## Security notes

- The API origin is fixed per profile; in `development` it must be a loopback
  `http` origin. Requests never follow redirects, so the Authorization header is
  not forwarded elsewhere.
- OAuth discovery must report the configured issuer, and every endpoint must be
  an `https` URL on that issuer.
- The callback server listens on `127.0.0.1` only and ignores requests whose
  `state` does not match.
- The production profile is disabled until production keys, issuer and
  cross-environment rejection are verified.
- The server's development MCP defaults apply only when `NODE_ENV` is
  `development`; deployed environments must set every `MCP_*` variable.

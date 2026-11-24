# Pacemaker Video

The Pacemaker storefront for courses, ebooks and workshops
([paceupcareer.com](https://www.paceupcareer.com)). It is a
[Next.js](https://nextjs.org) project using the App Router and TypeScript.

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework (App Router)
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Clerk](https://clerk.com/) - Authentication
- [PostgreSQL](https://www.postgresql.org/) + [Prisma 7](https://www.prisma.io/) - Database and ORM
- [Supabase Storage](https://supabase.com/docs/guides/storage) - Images and ebook PDFs (S3 API)
- [Stripe](https://stripe.com/) - Checkout
- [Wistia](https://wistia.com/) - Video player
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vitest](https://vitest.dev/) + Testing Library - Tests

## Development Setup

### Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager)
- Node.js v24.22 (set from `.nvmrc` by nvm)
- npm
- Docker (for the local PostgreSQL database)

### Installation

1. Clone the repository.

2. Set the correct Node.js version:

```bash
nvm install
nvm use
```

3. Install dependencies:

```bash
npm install
```

4. Set up environment variables:

```bash
cp .env.local.example .env.local
# Fill in the required environment variables
```

5. Start the database, apply migrations and seed it (see
   [Database](#database)).

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

`.env.local.example` lists every variable the app and scripts read.

| Group               | Variables                                                                                        | Used for                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Clerk               | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`                  | Sign-in and the `/api/webhook/clerk` user sync                     |
| Database            | `DATABASE_URL`, `DIRECT_URL`                                                                     | App queries; Prisma CLI prefers `DIRECT_URL`                       |
| Supabase            | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`                                      | Public storage URLs and the Supabase client                        |
| Supabase Storage S3 | `SUPABASE_S3_ENDPOINT`, `SUPABASE_S3_REGION`, `SUPABASE_S3_ACCESS_KEY`, `SUPABASE_S3_SECRET_KEY` | Uploads, the image proxy, seed and storage scripts                 |
| Buckets             | `SUPABASE_S3_IMG_BUCKET`, `SUPABASE_S3_EBOOK_BUCKET`                                             | Image bucket and ebook PDF bucket                                  |
| Stripe              | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`                              | Checkout and the `/api/stripe/webhook` endpoint                    |
| Tooling             | `JIRA_*`, `OPENROUTER_API_KEY`                                                                   | [Jira CLI](#jira-cli) and [git-cm](#git-ai-auto-commit-cli-git-cm) |
| Admin MCP           | `MCP_OAUTH_CLIENT_ID`, `MCP_API_JWT_*`                                                           | [Admin MCP](#admin-mcp-local-poc); optional in `npm run dev`       |

Local development uses the development buckets `image-dev` and
`document-dev`. Production uses `image` and `document`; do not point a local
`.env.local` at them.

Next.js and the Prisma CLI load `.env*` files with the same precedence, so a
local `.env.local` is enough for Prisma commands as well.

### Available Scripts

Development:

- `npm run dev` - Start development server
- `npm run build` - Generate Prisma Client and build production bundle
- `npm run start` - Start production server

Checks:

- `npm test` - Run Vitest in watch mode (`npm test -- --run` runs once)
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and auto-fix formatting issues
- `npm run validate-branch-name` - Validate git branch name
- `npm run precommit-tasks` - Run all pre-commit tasks

Database and storage (see [Data Maintenance Scripts](#data-maintenance-scripts)):

- `npm run prisma:generate` - Generate Prisma Client
- `npm run db:check-content` - Check that content rows point at existing files
- `npm run db:cleanup-production-content` - Clean up production content data
- `npm run db:move-legacy-thumbnails` - Copy legacy thumbnails into the image bucket
- `npm run db:replace-ebook-thumbnail` - Replace one ebook's thumbnail
- `npm run db:normalize-thumbnail-urls` - Normalize thumbnail URLs
- `npm run storage:archive-unreferenced` - Archive unreferenced storage objects
- `npm run check:public-pages` - Smoke check a deployed site's public pages

Tooling:

- `npm run jira -- <command>` - Run the local Jira CLI
- `npm run git-cm` - Generate a commit message with AI

## Database

### Local Database (Docker Compose)

`docker-compose.yml` runs PostgreSQL 15 as the `pacemaker-dev-postgres`
container on port `5433`.

```bash
docker compose up -d   # start
docker compose down    # stop
```

Use these connection values in `.env.local`:

```bash
DATABASE_URL=postgresql://pacemaker-video:postgres@localhost:5433/web
DIRECT_URL=postgresql://pacemaker-video:postgres@localhost:5433/web
```

### Database Migrations

After starting the database, run Prisma migrations:

```bash
npx prisma migrate dev
```

CI checks that `prisma/schema.prisma` and `prisma/migrations` stay in sync, and
runs `prisma migrate deploy` against production when a change is merged into
`main`.

### Seeding the Database

Prisma 7 does not seed automatically after `migrate dev` or `migrate reset`, so run the seed yourself:

```bash
npm run db:seed
```

- The seed only runs against a local database (localhost or the `pacemaker-dev-postgres` container). It deletes and recreates content, orders and My Page data.
- Content is the set visible on production on 2026-11-03 (`prisma/seed-data.ts`): 3 courses, 6 e-books, 4 workshops, 3 hero slides and 2 instructors. Workshop dates are shifted at seed time so the last one is upcoming.
- The test accounts are `admin@paceupcareer.com` and `user@paceupcareer.com`. The USER account has orders, course progress, workshop registrations and favorites, and a payment success page at `/mypage/payment-success?session_id=cs_test_seed_payment_success`.
- The seed never reads or writes storage. With `SUPABASE_S3_IMG_BUCKET=image-dev` and `SUPABASE_S3_EBOOK_BUCKET=document-dev` it stores URLs of files in those buckets; otherwise it uses `/img` fallback images and no e-book files.
- The files it points at are listed in `prisma/seed-files.json`. If the `-dev` buckets are new or empty, copy them once from production storage (dry run first):

  ```bash
  npm run storage:prepare-dev-seed-files
  npm run storage:prepare-dev-seed-files -- --apply
  ```

### Data Maintenance Scripts

Scripts in `scripts/` that check or change content data and storage. The ones
that write run as a dry run by default; pass `--apply` to make changes.

```bash
npm run db:check-content
npm run check:public-pages -- --base-url=https://www.paceupcareer.com
npm run db:cleanup-production-content            # dry run
npm run db:cleanup-production-content -- --apply # write
```

They read `.env.local`, which points at local and development resources. To run
them against production, set `DIRECT_URL`, `SUPABASE_S3_IMG_BUCKET` and
`SUPABASE_S3_EBOOK_BUCKET` for that command. See
`.agent/production-content-cleanup.md` for the production cleanup record.

### Naming Consistency (DB ↔ Code)

The names in the database and the code are different. Use this mapping to avoid mistakes:

| DB Enum (`ItemType`) | Code Name   |
| -------------------- | ----------- |
| `VIDEO`              | `courses`   |
| `DOCUMENT`           | `ebooks`    |
| `WORKSHOP`           | `workshops` |

- In the DB (Prisma), use `VIDEO`, `DOCUMENT`, `WORKSHOP`.
- In the code (front-end, routing, UI), use `courses`, `ebooks`, `workshops`.
- Always convert between DB values and code names when sending/receiving data.

### Internationalization (i18n) Rules

- Use **English** for logic, filters, and DB values
- Apply translations **only when displaying on the screen**
- Use English values in APIs, queries, and conditions
- Convert English values to the target language in the UI layer

## Testing

Run these before opening a pull request:

```bash
npm test -- --run
npm run typecheck
npm run build
npm run lint
```

For user-facing changes, also check the affected flows in a browser, including
signed-in flows. `.agent/testing-routine.md` has the full routine.

## Git Workflow

### Branch Naming Convention

Branches must follow this naming pattern:

- `main` - Main branch
- `chore/[task-name]` - Chores and maintenance
- `hotfix/[fix-name]` - Hot fixes
- `[ticket-number]/[feature-name]` - Feature branches

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that run:

1. Prisma Client generation
2. Branch name validation
3. TypeScript type checking
4. Lint-staged checks:
   - ESLint for `.js`, `.jsx`, `.ts`, `.tsx` files
   - Prettier for `.json`, `.md`, `.yaml`, `.yml` files

Lint-staged reads `.lintstagedrc.js`.

Run `npm run build` manually or in CI when you want the full Next.js production
build validation with all required environment variables configured.

### Continuous Integration

`.github/workflows/integration.yml` runs on every pull request and on pushes to
`main`: lint, Prisma schema/migration sync check, build and tests. On `main` it
also deploys migrations to production.

## Code Style

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 80
}
```

### VS Code Auto-fix Setup

To automatically format your code and resolve ESLint errors on save, you can configure your local VS Code workspace. The repository includes `.vscode/settings.json` configured with:

```json
{
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "always"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

If you prefer not to use these workspace settings, copy the values you want to your global VS Code User Settings instead.

### Tailwind Color Usage

Tailwind updates often, so some colors may change or be removed.

- If a color is missing, check the docs and update it while working.
- After all work is done, we’ll review and update colors in one go.

## Jira CLI

This repository includes a lightweight Jira CLI for common sprint workflows.

### Setup

`.env.local.example` already has the shared project values:

```bash
JIRA_BASE_URL=https://pacemakerca.atlassian.net
JIRA_PROJECT_KEY=PACE
JIRA_BOARD_ID=1
```

Each contributor adds their own Jira account values to `.env.local`:

```bash
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-own-api-token
```

- `JIRA_EMAIL`: the Atlassian account email you log into Jira with
- `JIRA_API_TOKEN`: a personal API token from Atlassian Account Settings at `https://id.atlassian.com/manage-profile/security/api-tokens`

Run `npm run jira -- me` to confirm authentication works.

Do not commit `.env.local` or share your personal API token in chat, email, or the repository.

### Common Commands

```bash
npm run jira -- me
npm run jira -- boards
npm run jira -- current-sprint
npm run jira -- backlog
npm run jira -- create --type Story --summary "Implement workshop detail page"
npm run jira -- update-description --issue PACE-123 --description-file ./ticket.md
npm run jira -- add-to-sprint --issue PACE-123 --current
```

Add `--json` to any read command for machine-readable output.

## Git AI Auto-Commit CLI (git-cm)

This repository includes an automated commit message generator using AI (Llama 3.3, GPT-4o-mini, and Gemini 2.5 Flash via OpenRouter).

### Prerequisites & Setup

1. **Install Dependencies**: Make sure you have installed devDependencies.
   ```bash
   npm install
   ```
2. **Add API Key**: Get an OpenRouter API key and add it to your `.env.local` or `.env` file:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
3. **Register Git Alias (Recommended)**: Run this command in your terminal to easily trigger the command with `git cm`:
   ```bash
   git config alias.cm "!node scripts/git-cm.js"
   ```

### Usage

1. Stage your changes:
   ```bash
   git add .
   ```
2. Run the auto-commit tool:
   ```bash
   git cm
   ```
3. The CLI will output a suggested commit message standardizing to Conventional Commits. Enter `Y` or press `Enter` to approve and commit, or `n` to cancel.

### Options

- `--verbose`: Includes a detailed explanation paragraph explaining the changes in the commit body.
  ```bash
  git cm --verbose
  ```
- `-y`: Auto-approves the suggested commit message and commits directly without asking for confirmation.
  ```bash
  git cm -y
  ```

## Admin MCP (local POC)

`mcp/` holds a local MCP server that lets an admin read and edit the home page
main visuals from Claude Code, Claude Desktop or Codex. Edits are previewed
first, including a preview drawn with the real banner design, and applied only
after the admin confirms. It signs in with Clerk and
calls only the `/api/mcp/*` routes; it never connects to the database.

`npm run dev` needs no `MCP_*` variables: when they are missing it uses
development defaults and a signing key generated in memory. Deployed
environments must set every `MCP_*` variable.

1. Run the app as usual (`npm run dev` with a seeded local database).
2. Build the MCP server (again after pulling changes to `mcp/`):

   ```bash
   cd mcp && npm ci && npm run build
   ```

3. Register it with Claude Code, using the absolute path to this repository:

   ```bash
   claude mcp add pacemaker-admin -- node /absolute/path/to/pacemaker-video/mcp/dist/index.js
   ```

   For Claude Desktop and Codex, see [`mcp/README.md`](mcp/README.md).

4. Ask "List the main visuals". A browser window opens; sign in with the seeded
   admin account (`admin@paceupcareer.com`), then ask again. Later requests
   reuse the sign-in stored in the OS credential store.

Notes:

- Only one MCP host can wait for a browser sign-in at a time.
- If the app is not on port 3000, add
  `-e PACEMAKER_MCP_API_ORIGIN=http://localhost:<port>` before `--` in
  `claude mcp add`.
- Ask for the `sign_out` tool to remove the stored sign-in.

## Project Docs

- `.agent/` - Working notes: testing routine, design system, English copy guide,
  seed plan, production cleanup record
- `docs/` - QA onboarding, the Stripe payment implementation plan and the
  admin MCP decision record (`admin-local-db-mcp-poc-decisions.md`)
- `mcp/README.md` - Admin MCP tools, sign-in and host configuration

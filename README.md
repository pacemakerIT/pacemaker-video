# Pacemaker Video

This is a [Next.js](https://nextjs.org) project using the App Router and TypeScript.

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Clerk](https://clerk.com/) - Authentication
- [Wistia](https://wistia.com/) - Video player
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Development Setup

### Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager)
- Node.js v20.16 (will be automatically set using nvm)
- npm

### Installation

1. Set the correct Node.js version:

```bash
nvm install
nvm use
```

2. Clone the repository

3. Install dependencies:

```bash
npm install
```

4. Set up environment variables:

```bash
cp .env.local.example .env.local
# Fill in the required environment variables
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run validate-branch-name` - Validate git branch name
- `npm run precommit-tasks` - Run all pre-commit tasks

## Docker Compose Setup

### Prerequisites

- Docker
- Docker Compose

### Configuration

The project uses Docker Compose to set up a local PostgreSQL database for development.

### Running the Database

To start the database:

```bash
docker-compose up -d
```

To stop the database:

```bash
docker-compose down
```

### Database Migrations

After starting the database, run Prisma migrations:

```bash
npx prisma migrate dev
```

### Seeding the Database

To populate your local database with initial video data (and potentially other sample data defined in prisma/seed.ts), run the following command:

```bash
npx prisma db seed
```

## Git Workflow

### Branch Naming Convention

Branches must follow this naming pattern:

- `main` - Main branch
- `chore/[task-name]` - Chores and maintenance
- `hotfix/[fix-name]` - Hot fixes
- `[ticket-number]/[feature-name]` - Feature branches

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that run:

1. Build validation
2. Branch name validation
3. TypeScript type checking
4. Lint-staged checks:
   - ESLint for `.js`, `.jsx`, `.ts`, `.tsx` files
   - Prettier for `.json`, `.md`, `.yaml`, `.yml` files

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

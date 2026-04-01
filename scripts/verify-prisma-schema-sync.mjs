import { execFileSync } from 'node:child_process';

function runGit(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function getChangedFiles(baseRef, headRef) {
  const output = runGit(['diff', '--name-only', `${baseRef}`, `${headRef}`]);
  return output ? output.split('\n').filter(Boolean) : [];
}

function getFileAtRef(ref, path) {
  try {
    return runGit(['show', `${ref}:${path}`]);
  } catch {
    return '';
  }
}

function normalizeSchema(schema) {
  const blocks = [];
  const lines = schema.split(/\r?\n/);
  let currentBlock = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('//')) {
      continue;
    }

    if (!currentBlock) {
      const blockMatch = line.match(
        /^(generator|datasource|model|enum|type|view)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{$/
      );

      if (!blockMatch) {
        continue;
      }

      currentBlock = {
        kind: blockMatch[1],
        name: blockMatch[2],
        lines: []
      };
      continue;
    }

    if (line === '}') {
      if (
        currentBlock.kind !== 'generator' &&
        currentBlock.kind !== 'datasource'
      ) {
        const normalizedLines =
          currentBlock.kind === 'enum'
            ? currentBlock.lines
            : [...currentBlock.lines].sort((a, b) => a.localeCompare(b));

        blocks.push({
          kind: currentBlock.kind,
          name: currentBlock.name,
          lines: normalizedLines
        });
      }

      currentBlock = null;
      continue;
    }

    currentBlock.lines.push(line);
  }

  return blocks
    .sort((a, b) => `${a.kind}:${a.name}`.localeCompare(`${b.kind}:${b.name}`))
    .map((block) => [`${block.kind} ${block.name}`, ...block.lines].join('\n'))
    .join('\n\n');
}

function main() {
  const [baseRef, headRef] = process.argv.slice(2);

  if (!baseRef || !headRef) {
    console.error(
      'Usage: node scripts/verify-prisma-schema-sync.mjs <base-ref> <head-ref>'
    );
    process.exit(2);
  }

  const changedFiles = getChangedFiles(baseRef, headRef);

  if (!changedFiles.includes('prisma/schema.prisma')) {
    console.log('No Prisma schema changes detected.');
    return;
  }

  const hasMigrationChange = changedFiles.some((file) =>
    /^prisma\/migrations\/.+\/migration\.sql$/.test(file)
  );

  if (hasMigrationChange) {
    console.log('Prisma schema and migration changes detected together.');
    return;
  }

  const baseSchema = getFileAtRef(baseRef, 'prisma/schema.prisma');
  const headSchema = getFileAtRef(headRef, 'prisma/schema.prisma');

  if (normalizeSchema(baseSchema) === normalizeSchema(headSchema)) {
    console.log(
      'Prisma schema changed only in generator/datasource metadata; no migration file is required.'
    );
    return;
  }

  console.error(
    'ERROR: Prisma datamodel changed but no Prisma migration file was added.'
  );
  console.error('Run: npx prisma migrate dev --name <description>');
  process.exit(1);
}

main();

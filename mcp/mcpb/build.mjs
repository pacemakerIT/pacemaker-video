// Builds the Claude Desktop extension (.mcpb) for the admin MCP:
//   npm run build:mcpb
// Output: mcp/.mcpb-build/pacemaker-admin-<version>.mcpb
//
// The server is bundled into one file with esbuild. @napi-rs/keyring is native,
// so it stays external and ships in node_modules next to the bundle, with the
// binaries for every platform in `PLATFORMS` (verified against package-lock.json)
// so one file installs on macOS (Apple silicon and Intel) and Windows.
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PLATFORMS = [
  'darwin-arm64',
  'darwin-x64',
  'win32-x64-msvc',
  'win32-arm64-msvc'
];

const root = path.resolve(import.meta.dirname, '..');
const buildDir = path.join(root, '.mcpb-build');
const stage = path.join(buildDir, 'bundle');
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);
const lock = JSON.parse(
  fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8')
);

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    stdio: ['ignore', 'pipe', 'inherit'],
    ...options
  }).toString();

fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(path.join(stage, 'server'), { recursive: true });

// 1) Bundle the server.
await build({
  entryPoints: [path.join(root, 'src/index.ts')],
  outfile: path.join(stage, 'server/index.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external: ['@napi-rs/keyring'],
  // Some bundled CommonJS dependencies call require() for Node built-ins.
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);"
  },
  logLevel: 'warning'
});

// 2) Manifest with the package version.
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'mcpb/manifest.json'), 'utf8')
);
manifest.version = pkg.version;
fs.writeFileSync(
  path.join(stage, 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);

// 3) Native keyring: the loader package plus the binary for each platform.
const scope = path.join(stage, 'node_modules/@napi-rs');
fs.mkdirSync(scope, { recursive: true });

const keyringSource = path.join(root, 'node_modules/@napi-rs/keyring');
fs.cpSync(keyringSource, path.join(scope, 'keyring'), { recursive: true });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mcpb-keyring-'));
for (const platform of PLATFORMS) {
  const name = `@napi-rs/keyring-${platform}`;
  const entry = lock.packages[`node_modules/${name}`];
  if (!entry) throw new Error(`${name} is not in package-lock.json`);

  const target = path.join(scope, `keyring-${platform}`);
  const installed = path.join(root, 'node_modules', name);
  if (fs.existsSync(installed)) {
    fs.cpSync(installed, target, { recursive: true });
    continue;
  }

  const tarballName = run('npm', [
    'pack',
    `${name}@${entry.version}`,
    '--pack-destination',
    tmp,
    '--silent'
  ]).trim();
  const tarball = path.join(tmp, tarballName);
  const digest =
    'sha512-' +
    createHash('sha512').update(fs.readFileSync(tarball)).digest('base64');
  if (digest !== entry.integrity) {
    throw new Error(
      `${name}@${entry.version} does not match the integrity hash in package-lock.json`
    );
  }
  fs.mkdirSync(target, { recursive: true });
  run('tar', ['-xzf', tarball, '-C', target, '--strip-components=1']);
}
fs.rmSync(tmp, { recursive: true, force: true });

// 4) Pack and validate with the MCPB CLI.
const mcpb = path.join(root, 'node_modules/.bin/mcpb');
const out = path.join(buildDir, `pacemaker-admin-${pkg.version}.mcpb`);
run(mcpb, ['validate', path.join(stage, 'manifest.json')]);
run(mcpb, ['pack', stage, out]);

const size = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
const sha = createHash('sha256').update(fs.readFileSync(out)).digest('hex');
console.log(
  `Built ${path.relative(process.cwd(), out)} (${size} MB)\nsha256 ${sha}`
);

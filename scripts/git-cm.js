#!/usr/bin/env node
/* eslint-disable */

function printIdentityHeader() {
  const name = 'Seulgi Lee';

  // Format date as YYYY-MM-DD HH:MM:SS
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const runDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // Print required header
  console.log(`git-cm: Developed by ${name}`);
  console.log(`Run Date: ${runDate}`);
  console.log('--------------------------------------------------------------');
}

// Print header first
printIdentityHeader();

// Load environment variables using path.resolve relative to the scripts folder
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

// Validate API Key
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.log('Error: OPENROUTER_API_KEY not found');
  process.exit(1);
}

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const { OpenAI } = require('openai');

function quoteGitPath(path) {
  return `"${path.replace(/"/g, '\\"')}"`;
}

function isIgnoredStagedFile(path) {
  return (
    path.endsWith('.docx') ||
    path.endsWith('.pdf') ||
    path.includes('/~$') ||
    path.includes('\\~$') ||
    path.endsWith('package-lock.json') ||
    path.endsWith('yarn.lock') ||
    path.endsWith('pnpm-lock.yaml')
  );
}

async function main() {
  let diff = '';
  try {
    const { stdout: stagedFilesOutput } = await execAsync(
      'git diff --staged --name-only'
    );
    const stagedFiles = stagedFilesOutput
      .split('\n')
      .map((file) => file.trim())
      .filter(Boolean);

    if (stagedFiles.length === 0) {
      console.log('No staged changes found.');
      process.exit(1);
    }

    const supportedFiles = stagedFiles.filter(
      (file) => !isIgnoredStagedFile(file)
    );
    const ignoredFiles = stagedFiles.filter((file) =>
      isIgnoredStagedFile(file)
    );

    if (ignoredFiles.length > 0) {
      console.log('Ignoring unsupported staged files:');
      ignoredFiles.forEach((file) => console.log(`- ${file}`));
    }

    if (supportedFiles.length === 0) {
      console.log(
        'No supported staged text files found for commit message generation.'
      );
      process.exit(1);
    }

    const diffCommand = `git diff --staged -- ${supportedFiles.map(quoteGitPath).join(' ')}`;
    const { stdout } = await execAsync(diffCommand);
    diff = stdout.trim();
    if (!diff) {
      console.log('No staged text diff found.');
      process.exit(1);
    }
    console.log(`Diff found: ${diff.length} characters`);
  } catch (e) {
    console.log('Unable to read staged git diff.');
    console.log(e.message);
    process.exit(1);
  }

  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey
  });

  const is_verbose = process.argv.includes('--verbose');
  const autoApprove = process.argv.includes('-y');
  const temperatureValue = 0.1;

  let systemPrompt = `You are an LLM running in a CLI tool, which writes semantic commit messages for the user. You will be given a git diff. You must output ONLY the commit message using the Conventional Commits standard format (e.g., 'feat: add logging'). Summarize all key distinct features in the git diff into a single commit message header. Look closely at all changed files; if multiple modals (such as review modal, alert modal, auth modal, order detail modal) were created/updated, summarize them collectively (e.g., 'redesign modals (review, alert, auth, order detail)' or similar) and combine with other features (e.g., 'feat: add git-cm script and redesign user modals (review, alert, auth, order detail)'). Do not omit any major changes. Respond in plain text suitable for pasting into git commit -m '...your commit message...'; just the plain text commit message with no Markdown, no rationale about why you chose it, etc.`;

  if (is_verbose) {
    systemPrompt = `You are an LLM running in a CLI tool, which writes semantic commit messages for the user. You will be given a git diff. You must output the commit message using the Conventional Commits standard format (e.g., 'feat: add logging') followed by a detailed body paragraph explaining the reasoning behind all these distinct changes. Respond in plain text suitable for git commit -m; do not include Markdown syntax or code blocks, just the raw text of the commit message.`;
  }

  const modelsToTry = [
    'meta-llama/llama-3.3-70b-instruct', // Cheap paid model
    'openai/gpt-4o-mini', // Fast and cheap model
    'google/gemini-2.5-flash' // Google cheap model
  ];

  for (const modelId of modelsToTry) {
    try {
      const response = await openai.chat.completions.create({
        model: modelId,
        temperature: temperatureValue,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the git diff:\n\n${diff}` }
        ]
      });

      const commitMessage = response.choices[0].message.content.trim();
      console.log('\nSuggested Commit Message:\n\n' + commitMessage + '\n');

      const askUser = () =>
        new Promise((resolve) => {
          const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
          });
          rl.question('Use this commit message? (Y/n): ', (answer) => {
            rl.close();
            resolve(answer);
          });
        });

      if (autoApprove) {
        console.log('Auto-approving commit (-y flag detected)...');
        require('child_process').spawnSync(
          'git',
          ['commit', '-m', commitMessage],
          { stdio: 'inherit' }
        );
      } else {
        const answer = await askUser();
        if (answer.toLowerCase() === 'y' || answer.trim() === '') {
          require('child_process').spawnSync(
            'git',
            ['commit', '-m', commitMessage],
            { stdio: 'inherit' }
          );
        } else {
          console.log('Commit cancelled.');
        }
      }

      return; // success -> end
    } catch (error) {
      console.log(`[Info] Model ${modelId} failed. Trying next model...`);
    }
  }

  console.error('Error: All fallback models failed. Please try again later.');
}

main();

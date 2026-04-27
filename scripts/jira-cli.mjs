#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

loadEnvFiles();

function loadEnvFiles() {
  const cwd = process.cwd();
  const fileNames = ['.env.local', '.env'];
  const shellEnv = new Set(Object.keys(process.env));

  for (const fileName of fileNames) {
    const filePath = path.join(cwd, fileName);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (shellEnv.has(key) || process.env[key] !== undefined) continue;

      let value = rawValue;
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = { _: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const trimmed = token.slice(2);
    const [key, inlineValue] = trimmed.split('=');

    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return args;
}

function requireEnv(name, fallback) {
  const value = fallback ?? process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to your shell environment or .env.local.`
    );
  }
  return value;
}

function jiraConfig(args) {
  const baseUrl = requireEnv('JIRA_BASE_URL', args.baseUrl || args.base);
  const email = requireEnv('JIRA_EMAIL', args.email);
  const apiToken = requireEnv('JIRA_API_TOKEN', args.token);
  const projectKey = requireEnv('JIRA_PROJECT_KEY', args.project);
  const boardId = args.board || process.env.JIRA_BOARD_ID || null;

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    email,
    apiToken,
    projectKey,
    boardId
  };
}

function authHeader(email, apiToken) {
  return `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;
}

async function jiraFetch(config, apiPath, options = {}) {
  const url = `${config.baseUrl}${apiPath}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: authHeader(config.email, config.apiToken),
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Jira request failed (${response.status} ${response.statusText}): ${text}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function adfFromText(text) {
  const paragraphs = String(text || '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line }]
    }));

  return {
    type: 'doc',
    version: 1,
    content: paragraphs.length
      ? paragraphs
      : [{ type: 'paragraph', content: [] }]
  };
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

function printRows(rows) {
  if (!rows.length) {
    console.log('No results.');
    return;
  }
  console.table(rows);
}

function issueSummary(issue) {
  return {
    key: issue.key,
    type: issue.fields?.issuetype?.name ?? '',
    status: issue.fields?.status?.name ?? '',
    priority: issue.fields?.priority?.name ?? '',
    assignee: issue.fields?.assignee?.displayName ?? 'Unassigned',
    summary: issue.fields?.summary ?? ''
  };
}

async function resolveBoardId(config) {
  if (config.boardId) {
    return String(config.boardId);
  }

  const data = await jiraFetch(
    config,
    `/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(
      config.projectKey
    )}&maxResults=50`
  );

  const board = data.values?.[0];
  if (!board) {
    throw new Error(
      `No Jira board found for project ${config.projectKey}. Set JIRA_BOARD_ID explicitly.`
    );
  }

  return String(board.id);
}

async function getActiveSprints(config, boardId) {
  const data = await jiraFetch(
    config,
    `/rest/agile/1.0/board/${boardId}/sprint?state=active`
  );
  return data.values || [];
}

async function getCurrentSprintId(config, boardId) {
  const sprints = await getActiveSprints(config, boardId);
  if (!sprints.length) {
    throw new Error('No active sprint found for this board.');
  }
  return String(sprints[0].id);
}

async function commandMe(config, args) {
  const profile = await jiraFetch(config, '/rest/api/3/myself');
  if (args.json) {
    printJson(profile);
    return;
  }

  printRows([
    {
      accountId: profile.accountId,
      displayName: profile.displayName,
      email: profile.emailAddress ?? '',
      timeZone: profile.timeZone ?? ''
    }
  ]);
}

async function commandBoards(config, args) {
  const data = await jiraFetch(
    config,
    `/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(
      config.projectKey
    )}&maxResults=50`
  );
  const boards = data.values || [];

  if (args.json) {
    printJson(boards);
    return;
  }

  printRows(
    boards.map((board) => ({
      id: board.id,
      name: board.name,
      type: board.type
    }))
  );
}

async function commandCurrentSprint(config, args) {
  const boardId = await resolveBoardId(config);
  const sprints = await getActiveSprints(config, boardId);

  if (!sprints.length) {
    if (args.json) {
      printJson({ sprint: null, issues: [] });
      return;
    }
    console.log('No active sprint found.');
    return;
  }

  const sprint = sprints[0];
  const issuesData = await jiraFetch(
    config,
    `/rest/agile/1.0/sprint/${sprint.id}/issue?maxResults=100&fields=summary,status,assignee,issuetype,priority`
  );
  const issues = issuesData.issues || [];

  if (args.json) {
    printJson({
      sprint: {
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      },
      issues: issues.map(issueSummary)
    });
    return;
  }

  console.log(`${sprint.name} (${sprint.state})`);
  printRows(issues.map(issueSummary));
}

async function commandBacklog(config, args) {
  const boardId = await resolveBoardId(config);
  const data = await jiraFetch(
    config,
    `/rest/agile/1.0/board/${boardId}/backlog?maxResults=100&fields=summary,status,assignee,issuetype,priority`
  );
  const issues = data.issues || [];

  if (args.json) {
    printJson(issues.map(issueSummary));
    return;
  }

  printRows(issues.map(issueSummary));
}

function readDescription(args) {
  if (args['description-file']) {
    return fs.readFileSync(
      path.resolve(process.cwd(), String(args['description-file'])),
      'utf8'
    );
  }
  return args.description || '';
}

async function commandCreate(config, args) {
  const summary = args.summary;
  if (!summary) {
    throw new Error('Missing --summary for issue creation.');
  }

  const issueType = args.type || 'Task';
  const labels = args.labels
    ? String(args.labels)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;
  const description = readDescription(args);

  const payload = {
    fields: {
      project: { key: config.projectKey },
      summary: String(summary),
      issuetype: { name: String(issueType) },
      description: adfFromText(description),
      ...(labels?.length ? { labels } : {})
    }
  };

  const created = await jiraFetch(config, '/rest/api/3/issue', {
    method: 'POST',
    body: payload
  });

  if (args.sprint || args.current) {
    const boardId = await resolveBoardId(config);
    const sprintId = args.sprint || (await getCurrentSprintId(config, boardId));
    await jiraFetch(config, `/rest/agile/1.0/sprint/${sprintId}/issue`, {
      method: 'POST',
      body: { issues: [created.key] }
    });
  }

  if (args.json) {
    printJson(created);
    return;
  }

  console.log(`Created ${created.key}`);
}

async function commandUpdateDescription(config, args) {
  const issueKey = args.issue || args.key;
  if (!issueKey) {
    throw new Error('Missing --issue. Example: --issue PACE-123');
  }

  const description = readDescription(args);

  await jiraFetch(
    config,
    `/rest/api/3/issue/${encodeURIComponent(String(issueKey))}`,
    {
      method: 'PUT',
      body: {
        fields: {
          description: adfFromText(description)
        }
      }
    }
  );

  if (args.json) {
    printJson({ issue: String(issueKey), updated: true });
    return;
  }

  console.log(`Updated description for ${issueKey}`);
}

async function commandAddToSprint(config, args) {
  const issueKeys = args.issue
    ? String(args.issue)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (!issueKeys.length) {
    throw new Error('Missing --issue. Example: --issue PACE-123');
  }

  const boardId = await resolveBoardId(config);
  const sprintId =
    args.sprint ||
    (args.current && (await getCurrentSprintId(config, boardId)));

  if (!sprintId) {
    throw new Error('Missing sprint target. Use --sprint <id> or --current.');
  }

  await jiraFetch(config, `/rest/agile/1.0/sprint/${sprintId}/issue`, {
    method: 'POST',
    body: { issues: issueKeys }
  });

  if (args.json) {
    printJson({ sprintId: String(sprintId), issues: issueKeys });
    return;
  }

  console.log(`Added ${issueKeys.join(', ')} to sprint ${sprintId}`);
}

function printHelp() {
  console.log(`Jira CLI

Usage:
  npm run jira -- <command> [options]

Commands:
  me
  boards
  current-sprint [--json]
  backlog [--json]
  create --summary "Title" [--type Story] [--description "Text"] [--description-file ./ticket.md] [--labels a,b] [--current] [--sprint 123]
  update-description --issue PACE-123 [--description "Text" | --description-file ./ticket.md]
  add-to-sprint --issue PACE-123[,PACE-124] [--current | --sprint 123]

Environment:
  JIRA_BASE_URL
  JIRA_EMAIL
  JIRA_API_TOKEN
  JIRA_PROJECT_KEY
  JIRA_BOARD_ID
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  const config = jiraConfig(args);

  switch (command) {
    case 'me':
      await commandMe(config, args);
      break;
    case 'boards':
      await commandBoards(config, args);
      break;
    case 'current-sprint':
      await commandCurrentSprint(config, args);
      break;
    case 'backlog':
      await commandBacklog(config, args);
      break;
    case 'create':
      await commandCreate(config, args);
      break;
    case 'update-description':
      await commandUpdateDescription(config, args);
      break;
    case 'add-to-sprint':
      await commandAddToSprint(config, args);
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

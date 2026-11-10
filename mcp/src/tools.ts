import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type {
  AppliedMainVisualChange,
  MainVisualProposal,
  MainVisualValues,
  PacemakerApi
} from './api.ts';
import { UserFacingError } from './errors.ts';
import { ProposalStore } from './proposals.ts';
import type { AuthSession } from './session.ts';
import type { Logger } from './token-store.ts';

function textResult(value: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: typeof value === 'string' ? value : JSON.stringify(value, null, 2)
      }
    ]
  };
}

function errorResult(error: unknown, log: Logger): CallToolResult {
  if (error instanceof UserFacingError) {
    return { ...textResult(error.message), isError: true };
  }
  log(
    `Unexpected tool error: ${error instanceof Error ? error.name : 'unknown'}`
  );
  return {
    ...textResult('Unexpected error in the Pacemaker MCP server.'),
    isError: true
  };
}

function formatValue(value: unknown): string {
  return value === null ? '(empty)' : JSON.stringify(value);
}

function formatChanges(before: MainVisualValues, after: MainVisualValues) {
  return Object.keys(after)
    .map((field) => {
      const key = field as keyof MainVisualValues;
      return `- ${field}: ${formatValue(before[key])} -> ${formatValue(after[key])}`;
    })
    .join('\n');
}

export function formatProposal(
  proposal: MainVisualProposal,
  proposalId: string,
  apiOrigin: string
): string {
  // Show only a preview link served by the configured Pacemaker API.
  const preview =
    new URL(proposal.previewUrl).origin === apiOrigin
      ? `Preview with the home page banner design (needs an admin sign-in in the browser): ${proposal.previewUrl}`
      : 'Preview link omitted: it did not point at the configured Pacemaker API.';

  return [
    `Proposed change to main visual ${proposal.mainVisual.id} (orderIndex ${proposal.mainVisual.orderIndex}):`,
    formatChanges(proposal.before, proposal.after),
    '',
    preview,
    '',
    `Nothing has been changed yet. Show this change to the user. Call apply_main_visual_update with proposalId "${proposalId}" only after the user explicitly confirms. The proposal expires at ${proposal.expiresAt}.`
  ].join('\n');
}

export function formatAppliedChange(applied: AppliedMainVisualChange): string {
  return [
    `Applied to main visual ${applied.mainVisual.id}. The home page now shows the new values.`,
    formatChanges(applied.before, applied.after),
    '',
    `Audit log id: ${applied.auditLogId}.`,
    `To undo, propose these previous values: ${JSON.stringify(applied.before)}`
  ].join('\n');
}

const changesInputSchema = z
  .object({
    title: z
      .string()
      .optional()
      .describe('New title, up to 120 characters and 3 lines'),
    description: z
      .string()
      .nullable()
      .optional()
      .describe('New description, one line up to 300 characters; "" clears it'),
    linkName: z
      .string()
      .nullable()
      .optional()
      .describe('New button text, up to 40 characters; "" clears it'),
    link: z
      .string()
      .nullable()
      .optional()
      .describe(
        'New button link: a path on the site such as /courses; "" clears it'
      ),
    isPublic: z.boolean().optional().describe('Show on the home page or hide')
  })
  .strict();

export function registerTools(
  server: McpServer,
  deps: { api: PacemakerApi; session: AuthSession; log: Logger }
) {
  const { api, session, log } = deps;
  const proposals = new ProposalStore();

  server.registerTool(
    'list_main_visuals',
    {
      title: 'List main visuals',
      description:
        'List the Pacemaker home page main visuals (banners) in display order. Returns id, title, isPublic and orderIndex. Read-only.',
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async () => {
      try {
        return textResult(await api.listMainVisuals());
      } catch (error) {
        return errorResult(error, log);
      }
    }
  );

  server.registerTool(
    'get_main_visual',
    {
      title: 'Get main visual',
      description:
        'Get one Pacemaker home page main visual by id. Returns id, title, description, linkName (button text), link, isPublic and orderIndex. Read-only.',
      inputSchema: {
        id: z.uuid().describe('Main visual id from list_main_visuals')
      },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ id }) => {
      try {
        return textResult(await api.getMainVisual(id));
      } catch (error) {
        return errorResult(error, log);
      }
    }
  );

  server.registerTool(
    'propose_main_visual_update',
    {
      title: 'Propose a main visual change',
      description:
        'Preview a change to one main visual: title, description, linkName (button text), link (a path on the site) or isPublic. Writes nothing. Returns a before/after list, a preview link drawn with the home page banner design, and a proposalId for apply_main_visual_update.',
      inputSchema: {
        id: z.uuid().describe('Main visual id from list_main_visuals'),
        changes: changesInputSchema.describe('Only the fields to change')
      },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ id, changes }) => {
      try {
        const proposal = await api.proposeMainVisualChange(id, changes);
        const proposalId = proposals.add(
          proposal.changeToken,
          new Date(proposal.expiresAt)
        );
        return textResult(formatProposal(proposal, proposalId, api.origin));
      } catch (error) {
        return errorResult(error, log);
      }
    }
  );

  server.registerTool(
    'apply_main_visual_update',
    {
      title: 'Apply a main visual change',
      description:
        'Apply a change previously shown with propose_main_visual_update. Call only after the user has seen the proposal and explicitly confirmed it. Changes the live home page and records an audit log entry.',
      inputSchema: {
        proposalId: z
          .string()
          .regex(/^[0-9a-f]{8}$/)
          .describe('proposalId from propose_main_visual_update')
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async ({ proposalId }) => {
      try {
        const changeToken = proposals.take(proposalId);
        if (!changeToken) {
          throw new UserFacingError(
            'That proposal is unknown, already used or expired. Propose the change again.'
          );
        }
        return textResult(
          formatAppliedChange(await api.applyMainVisualChange(changeToken))
        );
      } catch (error) {
        return errorResult(error, log);
      }
    }
  );

  server.registerTool(
    'sign_in',
    {
      title: 'Sign in to Pacemaker',
      description:
        'Sign in to Pacemaker with an admin account, or report the current sign-in. Opens a browser when a new sign-in is needed.',
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async () => {
      try {
        const result = await session.signIn();
        if (result.status === 'pending') {
          return textResult(
            `A browser window was opened for Pacemaker sign-in. If it did not appear, open ${result.authorizeUrl}. After signing in, run your request again.`
          );
        }
        return textResult(
          result.persistent
            ? 'Signed in to Pacemaker with admin access.'
            : 'Signed in to Pacemaker with admin access. The OS credential store is unavailable, so the sign-in lasts only until this MCP server stops.'
        );
      } catch (error) {
        return errorResult(error, log);
      }
    }
  );

  server.registerTool(
    'sign_out',
    {
      title: 'Sign out of Pacemaker',
      description:
        'Sign out of Pacemaker on this computer for this MCP host and revoke the stored sign-in.',
      annotations: { destructiveHint: false, openWorldHint: false }
    },
    async () => {
      try {
        const result = await session.signOut();
        if (!result.hadSession) {
          return textResult('There was no stored Pacemaker sign-in.');
        }
        return textResult(
          result.revoked
            ? 'Signed out of Pacemaker and revoked the stored sign-in.'
            : 'Removed the stored Pacemaker sign-in from this computer. The sign-in service did not confirm revocation; an admin can revoke the grant in Clerk if needed.'
        );
      } catch (error) {
        return errorResult(error, log);
      }
    }
  );
}

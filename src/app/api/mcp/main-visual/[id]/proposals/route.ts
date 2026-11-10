import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MCP_MAIN_VISUAL_WRITE_SCOPE } from '@/lib/mcp-api-token';
import {
  describeChangeErrors,
  diffMainVisual,
  findChangeConflict,
  mainVisualChangesSchema,
  signMainVisualChangeToken
} from '@/lib/mcp-main-visual-change';
import {
  MCP_MAIN_VISUAL_DETAIL_SELECT,
  previewOriginFor,
  toEditableMainVisual
} from '@/lib/mcp-main-visual-store';
import {
  authorizeMcpRequest,
  MCP_NO_STORE_HEADERS,
  mcpErrorResponse
} from '@/lib/mcp-request-auth';

const mainVisualIdSchema = z.uuid();
const proposalBodySchema = z.object({ changes: z.unknown() });

// Previews a change without writing anything. The returned change token is
// the only way to apply exactly this change; the preview URL shows it with the
// home page banner component.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorization = await authorizeMcpRequest(
    request,
    MCP_MAIN_VISUAL_WRITE_SCOPE
  );
  if (!authorization.ok) {
    return authorization.response;
  }
  const { principal } = authorization;

  const { id } = await params;
  const parsedId = mainVisualIdSchema.safeParse(id);
  if (!parsedId.success) {
    return mcpErrorResponse('Main visual id must be a UUID.', 400);
  }

  const body = proposalBodySchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!body.success) {
    return mcpErrorResponse(
      'Request body must be { "changes": { ... } }.',
      400
    );
  }
  const changes = mainVisualChangesSchema.safeParse(body.data.changes);
  if (!changes.success) {
    return mcpErrorResponse(describeChangeErrors(changes.error), 400);
  }

  try {
    const visual = await prisma.mainVisual.findUnique({
      where: { id: parsedId.data },
      select: MCP_MAIN_VISUAL_DETAIL_SELECT
    });
    if (!visual) {
      return mcpErrorResponse('Main visual not found.', 404);
    }

    const current = toEditableMainVisual(visual);
    const diff = diffMainVisual(current, changes.data);
    if (Object.keys(diff.after).length === 0) {
      return mcpErrorResponse(
        'Nothing to change; the banner already has these values.',
        400
      );
    }
    const conflict = findChangeConflict(current, diff.after);
    if (conflict) {
      return mcpErrorResponse(conflict, 400);
    }

    const claims = {
      subject: principal.subject,
      clientId: principal.clientId,
      mainVisualId: visual.id,
      changes: diff.after,
      baseUpdatedAt: visual.updatedAt.toISOString()
    };
    const [change, preview] = await Promise.all([
      signMainVisualChangeToken('apply', claims),
      signMainVisualChangeToken('preview', claims)
    ]);

    return NextResponse.json(
      {
        mainVisual: { id: visual.id, orderIndex: visual.orderIndex },
        before: diff.before,
        after: diff.after,
        changeToken: change.token,
        previewUrl: `${previewOriginFor(request)}/admin/main-visual/preview/${preview.token}`,
        expiresAt: change.expiresAt.toISOString()
      },
      { status: 200, headers: MCP_NO_STORE_HEADERS }
    );
  } catch {
    return mcpErrorResponse('Failed to prepare the main visual change.', 500);
  }
}

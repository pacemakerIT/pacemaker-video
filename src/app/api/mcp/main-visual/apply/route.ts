import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MCP_MAIN_VISUAL_WRITE_SCOPE } from '@/lib/mcp-api-token';
import {
  diffMainVisual,
  findChangeConflict,
  type MainVisualChangeClaims,
  verifyMainVisualChangeToken
} from '@/lib/mcp-main-visual-change';
import {
  MCP_MAIN_VISUAL_DETAIL_SELECT,
  toEditableMainVisual
} from '@/lib/mcp-main-visual-store';
import {
  authorizeMcpRequest,
  MCP_NO_STORE_HEADERS,
  mcpErrorResponse
} from '@/lib/mcp-request-auth';

const applyBodySchema = z.object({ changeToken: z.string().min(1).max(8192) });

class ApplyRejected extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const STALE_MESSAGE =
  'The banner changed after the preview. Propose the change again.';

// Applies a change exactly as previewed. The update only matches the row
// version seen at preview time, so a stale or replayed token changes nothing.
export async function POST(request: Request) {
  const authorization = await authorizeMcpRequest(
    request,
    MCP_MAIN_VISUAL_WRITE_SCOPE
  );
  if (!authorization.ok) {
    return authorization.response;
  }
  const { principal } = authorization;

  const body = applyBodySchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!body.success) {
    return mcpErrorResponse(
      'Request body must be { "changeToken": "..." }.',
      400
    );
  }

  let claims: MainVisualChangeClaims;
  try {
    claims = await verifyMainVisualChangeToken(body.data.changeToken, 'apply');
  } catch {
    return mcpErrorResponse(
      'The change preview expired or is not valid. Propose the change again.',
      400
    );
  }

  if (
    claims.subject !== principal.subject ||
    claims.clientId !== principal.clientId
  ) {
    return mcpErrorResponse(
      'This change was proposed by a different sign-in.',
      403
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const visual = await tx.mainVisual.findUnique({
        where: { id: claims.mainVisualId },
        select: MCP_MAIN_VISUAL_DETAIL_SELECT
      });
      if (!visual) {
        throw new ApplyRejected('Main visual not found.', 404);
      }
      if (visual.updatedAt.toISOString() !== claims.baseUpdatedAt) {
        throw new ApplyRejected(STALE_MESSAGE, 409);
      }

      const current = toEditableMainVisual(visual);
      const diff = diffMainVisual(current, claims.changes);
      if (
        Object.keys(diff.after).length === 0 ||
        findChangeConflict(current, diff.after)
      ) {
        throw new ApplyRejected(STALE_MESSAGE, 409);
      }

      const updated = await tx.mainVisual.updateMany({
        where: { id: visual.id, updatedAt: visual.updatedAt },
        data: diff.after
      });
      if (updated.count !== 1) {
        throw new ApplyRejected(STALE_MESSAGE, 409);
      }

      const auditLog = await tx.mcpAuditLog.create({
        data: {
          actorClerkId: principal.subject,
          clientId: principal.clientId,
          action: 'main_visual.update',
          entityId: visual.id,
          before: diff.before,
          after: diff.after
        },
        select: { id: true }
      });

      const saved = await tx.mainVisual.findUniqueOrThrow({
        where: { id: visual.id },
        select: MCP_MAIN_VISUAL_DETAIL_SELECT
      });

      return { saved, diff, auditLogId: auditLog.id };
    });

    revalidatePath('/admin/main-visual');
    revalidatePath('/');

    const { updatedAt, ...mainVisual } = result.saved;
    return NextResponse.json(
      {
        mainVisual: { ...mainVisual, updatedAt: updatedAt.toISOString() },
        before: result.diff.before,
        after: result.diff.after,
        auditLogId: result.auditLogId
      },
      { status: 200, headers: MCP_NO_STORE_HEADERS }
    );
  } catch (error) {
    if (error instanceof ApplyRejected) {
      return mcpErrorResponse(error.message, error.status);
    }
    return mcpErrorResponse('Failed to apply the main visual change.', 500);
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MCP_MAIN_VISUAL_READ_SCOPE } from '@/lib/mcp-api-token';
import {
  authorizeMcpRequest,
  MCP_NO_STORE_HEADERS,
  mcpErrorResponse
} from '@/lib/mcp-request-auth';

const mainVisualIdSchema = z.uuid();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorization = await authorizeMcpRequest(
    request,
    MCP_MAIN_VISUAL_READ_SCOPE
  );
  if (!authorization.ok) {
    return authorization.response;
  }

  const { id } = await params;
  const parsedId = mainVisualIdSchema.safeParse(id);
  if (!parsedId.success) {
    return mcpErrorResponse('Main visual id must be a UUID.', 400);
  }

  try {
    const visual = await prisma.mainVisual.findUnique({
      where: { id: parsedId.data },
      select: {
        id: true,
        title: true,
        description: true,
        linkName: true,
        link: true,
        isPublic: true,
        orderIndex: true
      }
    });

    if (!visual) {
      return mcpErrorResponse('Main visual not found.', 404);
    }

    return NextResponse.json(visual, {
      status: 200,
      headers: MCP_NO_STORE_HEADERS
    });
  } catch {
    return mcpErrorResponse('Failed to fetch main visual.', 500);
  }
}

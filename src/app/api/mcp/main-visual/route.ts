import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MCP_MAIN_VISUAL_READ_SCOPE } from '@/lib/mcp-api-token';
import {
  authorizeMcpRequest,
  MCP_NO_STORE_HEADERS,
  mcpErrorResponse
} from '@/lib/mcp-request-auth';

export async function GET(request: Request) {
  const authorization = await authorizeMcpRequest(
    request,
    MCP_MAIN_VISUAL_READ_SCOPE
  );
  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const visuals = await prisma.mainVisual.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        isPublic: true,
        orderIndex: true
      }
    });

    return NextResponse.json(visuals, {
      status: 200,
      headers: MCP_NO_STORE_HEADERS
    });
  } catch {
    return mcpErrorResponse('Failed to fetch main visuals.', 500);
  }
}

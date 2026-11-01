import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminAccessForClerkUserId } from '@/lib/admin-auth';
import {
  MCP_MAIN_VISUAL_READ_SCOPE,
  verifyMcpApiAccessToken
} from '@/lib/mcp-api-token';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: NO_STORE_HEADERS });
}

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);

  if (!match) {
    return errorResponse('Bearer token required.', 401);
  }

  let principal;
  try {
    principal = await verifyMcpApiAccessToken(
      match[1],
      MCP_MAIN_VISUAL_READ_SCOPE
    );
  } catch {
    return errorResponse('Unauthorized.', 401);
  }

  const adminAccess = await getAdminAccessForClerkUserId(principal.subject);
  if (!adminAccess.ok) {
    return errorResponse(adminAccess.error, adminAccess.status);
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
      headers: NO_STORE_HEADERS
    });
  } catch {
    return errorResponse('Failed to fetch main visuals.', 500);
  }
}

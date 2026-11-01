import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAdminAccessForClerkUserId } from '@/lib/admin-auth';
import {
  MCP_MAIN_VISUAL_READ_SCOPE,
  signMcpApiAccessToken
} from '@/lib/mcp-api-token';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache'
};

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: NO_STORE_HEADERS });
}

export async function POST() {
  const expectedClientId = process.env.MCP_OAUTH_CLIENT_ID?.trim();
  if (!expectedClientId) {
    return errorResponse('MCP OAuth client is not configured.', 503);
  }

  const authState = await auth({ acceptsToken: 'oauth_token' });
  if (
    !authState.isAuthenticated ||
    authState.tokenType !== 'oauth_token' ||
    !authState.userId ||
    !authState.clientId
  ) {
    return errorResponse('Unauthorized.', 401);
  }

  if (authState.clientId !== expectedClientId) {
    return errorResponse('Forbidden.', 403);
  }

  if (!authState.scopes.includes(MCP_MAIN_VISUAL_READ_SCOPE)) {
    return errorResponse('Required OAuth scope is missing.', 403);
  }

  const adminAccess = await getAdminAccessForClerkUserId(authState.userId);
  if (!adminAccess.ok) {
    return errorResponse(adminAccess.error, adminAccess.status);
  }

  try {
    const accessToken = await signMcpApiAccessToken({
      subject: authState.userId,
      clientId: authState.clientId,
      scopes: [MCP_MAIN_VISUAL_READ_SCOPE]
    });

    return NextResponse.json(
      {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 300,
        scope: MCP_MAIN_VISUAL_READ_SCOPE
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch {
    return errorResponse('MCP API token service is unavailable.', 503);
  }
}

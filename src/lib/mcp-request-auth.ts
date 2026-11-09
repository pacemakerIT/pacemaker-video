import { NextResponse } from 'next/server';
import { getAdminAccessForClerkUserId } from '@/lib/admin-auth';
import {
  type McpApiTokenPrincipal,
  verifyMcpApiAccessToken
} from '@/lib/mcp-api-token';
import { McpScopeError } from '@/lib/mcp-scope-error';

export const MCP_NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export function mcpErrorResponse(error: string, status: number, code?: string) {
  return NextResponse.json(code ? { error, code } : { error }, {
    status,
    headers: MCP_NO_STORE_HEADERS
  });
}

export type McpRequestAuthorization =
  | { ok: true; principal: McpApiTokenPrincipal }
  | { ok: false; response: NextResponse };

// Accepts only the Pacemaker-issued MCP API token, never a Clerk session or
// OAuth token, and rechecks the current DB admin role on every data request.
export async function authorizeMcpRequest(
  request: Request,
  requiredScope: string
): Promise<McpRequestAuthorization> {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);

  if (!match) {
    return {
      ok: false,
      response: mcpErrorResponse('Bearer token required.', 401)
    };
  }

  let principal: McpApiTokenPrincipal;
  try {
    principal = await verifyMcpApiAccessToken(match[1], requiredScope);
  } catch (error) {
    if (error instanceof McpScopeError) {
      return {
        ok: false,
        response: mcpErrorResponse(
          `This sign-in does not grant ${error.requiredScope}.`,
          403,
          'insufficient_scope'
        )
      };
    }
    return { ok: false, response: mcpErrorResponse('Unauthorized.', 401) };
  }

  const adminAccess = await getAdminAccessForClerkUserId(principal.subject);
  if (!adminAccess.ok) {
    return {
      ok: false,
      response: mcpErrorResponse(adminAccess.error, adminAccess.status)
    };
  }

  return { ok: true, principal };
}

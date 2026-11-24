// Thrown for an otherwise valid MCP API token that lacks the scope a route
// needs, so the route can answer 403 and the MCP can ask for a new sign-in.
export class McpScopeError extends Error {
  constructor(readonly requiredScope: string) {
    super(`MCP access token is missing the ${requiredScope} scope.`);
    this.name = 'McpScopeError';
  }
}

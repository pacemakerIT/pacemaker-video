import { z } from 'zod';
import { UserFacingError } from './errors.ts';
import type { FetchFn } from './oauth.ts';
import type { AuthSession } from './session.ts';

const REQUEST_TIMEOUT_MS = 10_000;

const mainVisualSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  isPublic: z.boolean(),
  orderIndex: z.number()
});

const mainVisualDetailSchema = mainVisualSummarySchema.extend({
  description: z.string().nullable()
});

const editableValuesSchema = z
  .object({
    title: z.string(),
    description: z.string().nullable(),
    linkName: z.string().nullable(),
    link: z.string().nullable(),
    isPublic: z.boolean()
  })
  .partial();

const proposalSchema = z.object({
  mainVisual: z.object({ id: z.string(), orderIndex: z.number() }),
  before: editableValuesSchema,
  after: editableValuesSchema,
  changeToken: z.string().min(1),
  previewUrl: z.url(),
  expiresAt: z.iso.datetime()
});

const appliedChangeSchema = z.object({
  mainVisual: mainVisualDetailSchema.extend({
    linkName: z.string().nullable(),
    link: z.string().nullable()
  }),
  before: editableValuesSchema,
  after: editableValuesSchema,
  auditLogId: z.string()
});

export type MainVisualSummary = z.infer<typeof mainVisualSummarySchema>;
export type MainVisualDetail = z.infer<typeof mainVisualDetailSchema>;
export type MainVisualValues = z.infer<typeof editableValuesSchema>;
export type MainVisualProposal = z.infer<typeof proposalSchema>;
export type AppliedMainVisualChange = z.infer<typeof appliedChangeSchema>;

// Calls only the fixed Pacemaker MCP routes on the configured API origin.
export class PacemakerApi {
  readonly #origin: string;
  readonly #session: AuthSession;
  readonly #fetchFn: FetchFn;

  constructor(input: {
    origin: string;
    session: AuthSession;
    fetchFn?: FetchFn;
  }) {
    this.#origin = input.origin;
    this.#session = input.session;
    this.#fetchFn = input.fetchFn ?? fetch;
  }

  get origin(): string {
    return this.#origin;
  }

  async listMainVisuals(): Promise<MainVisualSummary[]> {
    const body = await this.#request('/api/mcp/main-visual');
    return this.#parse(z.array(mainVisualSummarySchema), body);
  }

  async getMainVisual(id: string): Promise<MainVisualDetail> {
    const body = await this.#request(
      `/api/mcp/main-visual/${encodeURIComponent(id)}`
    );
    return this.#parse(mainVisualDetailSchema, body);
  }

  // Previews a change; nothing is written until applyMainVisualChange.
  async proposeMainVisualChange(
    id: string,
    changes: MainVisualValues
  ): Promise<MainVisualProposal> {
    const body = await this.#request(
      `/api/mcp/main-visual/${encodeURIComponent(id)}/proposals`,
      { changes }
    );
    return this.#parse(proposalSchema, body);
  }

  async applyMainVisualChange(
    changeToken: string
  ): Promise<AppliedMainVisualChange> {
    const body = await this.#request('/api/mcp/main-visual/apply', {
      changeToken
    });
    return this.#parse(appliedChangeSchema, body);
  }

  #parse<T>(schema: z.ZodType<T>, body: unknown): T {
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new UserFacingError(
        'The Pacemaker API returned an unexpected response.'
      );
    }
    return parsed.data;
  }

  // GET without a body, POST with a JSON body.
  async #request(path: string, jsonBody?: unknown): Promise<unknown> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await this.#session.getApiToken();
      let response: Response;
      try {
        response = await this.#fetchFn(`${this.#origin}${path}`, {
          method: jsonBody === undefined ? 'GET' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            ...(jsonBody === undefined
              ? {}
              : { 'Content-Type': 'application/json' })
          },
          body: jsonBody === undefined ? undefined : JSON.stringify(jsonBody),
          // Never forward the Authorization header to a redirect target.
          redirect: 'manual',
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
      } catch {
        throw new UserFacingError(
          `Could not reach the Pacemaker API at ${this.#origin}. Is the server running?`
        );
      }

      if (response.status === 401 && attempt === 0) {
        // The API token expired or was rejected; get a fresh one and retry once.
        this.#session.invalidateApiToken();
        continue;
      }

      const payload = (await response.json().catch(() => null)) as unknown;
      const serverError =
        payload &&
        typeof payload === 'object' &&
        'error' in payload &&
        typeof payload.error === 'string'
          ? payload.error
          : undefined;
      const serverCode =
        payload &&
        typeof payload === 'object' &&
        'code' in payload &&
        typeof payload.code === 'string'
          ? payload.code
          : undefined;

      switch (response.status) {
        case 200:
          return payload;
        case 400:
          throw new UserFacingError(serverError ?? 'Invalid request.');
        case 401:
          throw new UserFacingError(
            'Pacemaker rejected the sign-in. Run sign_out and then sign in again.'
          );
        case 403:
          if (serverCode === 'insufficient_scope') {
            throw new UserFacingError(
              'This Pacemaker sign-in does not allow editing main visuals. Run sign_out, then sign in again and allow editing.'
            );
          }
          throw new UserFacingError(
            serverError === 'This change was proposed by a different sign-in.'
              ? serverError
              : 'Your Pacemaker account does not have admin access.'
          );
        case 404:
          throw new UserFacingError(serverError ?? 'Not found.');
        case 409:
          throw new UserFacingError(
            serverError ??
              'The banner changed after the preview. Propose the change again.'
          );
        default:
          throw new UserFacingError(
            `The Pacemaker API request failed (HTTP ${response.status}).`
          );
      }
    }

    throw new UserFacingError('The Pacemaker API request failed.');
  }
}

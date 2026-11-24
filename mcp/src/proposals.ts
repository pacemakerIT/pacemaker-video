import { randomBytes } from 'node:crypto';

type StoredProposal = { changeToken: string; expiresAt: number };

// Keeps server change tokens in this MCP process so the apply tool takes a
// short proposal id instead of the signed token. Proposals do not survive a
// restart; the server rejects expired tokens anyway.
export class ProposalStore {
  readonly #proposals = new Map<string, StoredProposal>();
  readonly #now: () => number;

  constructor(now: () => number = Date.now) {
    this.#now = now;
  }

  add(changeToken: string, expiresAt: Date): string {
    this.#prune();
    const id = randomBytes(4).toString('hex');
    this.#proposals.set(id, { changeToken, expiresAt: expiresAt.getTime() });
    return id;
  }

  // Each proposal can be taken once.
  take(id: string): string | null {
    this.#prune();
    const proposal = this.#proposals.get(id);
    this.#proposals.delete(id);
    return proposal?.changeToken ?? null;
  }

  #prune() {
    const now = this.#now();
    for (const [id, proposal] of this.#proposals) {
      if (proposal.expiresAt <= now) {
        this.#proposals.delete(id);
      }
    }
  }
}

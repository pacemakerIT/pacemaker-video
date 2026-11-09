import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatAppliedChange, formatProposal } from './tools.ts';

const PROPOSAL = {
  mainVisual: { id: 'visual-1', orderIndex: 2 },
  before: { title: 'Old\ntitle', description: null },
  after: { title: 'New title', description: 'Added' },
  changeToken: 'change-token',
  previewUrl: 'http://localhost:3000/admin/main-visual/preview/abc',
  expiresAt: '2026-11-08T10:10:00.000Z'
};

describe('formatProposal', () => {
  it('lists the change, the preview link and the confirmation rule', () => {
    const text = formatProposal(PROPOSAL, 'ab12cd34', 'http://localhost:3000');

    assert.match(text, /- title: "Old\\ntitle" -> "New title"/);
    assert.match(text, /- description: \(empty\) -> "Added"/);
    assert.match(text, /preview\/abc/);
    assert.match(text, /Nothing has been changed yet/);
    assert.match(
      text,
      /proposalId "ab12cd34" only after the user explicitly confirms/
    );
    assert.doesNotMatch(text, /change-token/);
  });

  it('omits a preview link on another origin', () => {
    const text = formatProposal(
      { ...PROPOSAL, previewUrl: 'https://evil.test/admin/preview/abc' },
      'ab12cd34',
      'http://localhost:3000'
    );

    assert.doesNotMatch(text, /evil\.test/);
    assert.match(text, /Preview link omitted/);
  });
});

describe('formatAppliedChange', () => {
  it('reports the audit id and how to undo', () => {
    const text = formatAppliedChange({
      mainVisual: {
        id: 'visual-1',
        title: 'New title',
        description: 'Added',
        linkName: null,
        link: null,
        isPublic: true,
        orderIndex: 2
      },
      before: PROPOSAL.before,
      after: PROPOSAL.after,
      auditLogId: 'audit-1'
    });

    assert.match(text, /Audit log id: audit-1/);
    assert.match(
      text,
      /propose these previous values: \{"title":"Old\\ntitle","description":null\}/
    );
  });
});

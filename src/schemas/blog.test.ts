import { describe, expect, it } from 'vitest';
import { blogSchema } from './blog';

const validPost = {
  title: 'A practical post',
  description: 'A short description.',
  pubDate: '2026-11-23',
  type: 'CAREER PLAYBOOK',
  typeCategory: 'leadership',
  tldr: 'A concise takeaway.',
  readTime: '5 min read',
};

describe('blog post metadata schema', () => {
  it('accepts linked and label-only artifacts and applies optional defaults', () => {
    const result = blogSchema.safeParse({
      ...validPost,
      artifacts: [
        { label: 'Repository', url: 'https://example.com/repo' },
        { label: 'Metrics' },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.artifacts).toEqual([
        { label: 'Repository', url: 'https://example.com/repo' },
        { label: 'Metrics' },
      ]);
      expect(result.data.featured).toBe(false);
    }
  });

  it('rejects missing required metadata, empty artifact labels, and non-web artifact URLs', () => {
    const { title: _title, ...missingTitle } = validPost;
    expect(blogSchema.safeParse(missingTitle).success).toBe(false);
    expect(blogSchema.safeParse({ ...validPost, title: '' }).success).toBe(false);
    expect(
      blogSchema.safeParse({
        ...validPost,
        artifacts: [{ label: 'Unsafe', url: 'javascript:alert(1)' }],
      }).success,
    ).toBe(false);
    expect(
      blogSchema.safeParse({
        ...validPost,
        artifacts: [{ label: '' }],
      }).success,
    ).toBe(false);
  });
});

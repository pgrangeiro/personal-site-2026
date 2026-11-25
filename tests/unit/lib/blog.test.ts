import { describe, expect, it } from 'vitest';
import { getBlogCategories } from '../../../src/lib/blogCategories';

describe('blog categories', () => {
  it('derives distinct categories from posts in stable label order', () => {
    expect(
      getBlogCategories([
        { data: { category: { id: 'leadership', label: 'Career Playbooks' } } },
        { data: { category: { id: 'ai', label: 'AI & Systems' } } },
        { data: { category: { id: 'leadership', label: 'Career Playbooks' } } },
      ]),
    ).toEqual([
      { id: 'ai', label: 'AI & Systems' },
      { id: 'leadership', label: 'Career Playbooks' },
    ]);
  });

  it('rejects conflicting labels for a category ID', () => {
    expect(() =>
      getBlogCategories([
        { data: { category: { id: 'ai', label: 'AI & Systems' } } },
        { data: { category: { id: 'ai', label: 'Artificial Intelligence' } } },
      ]),
    ).toThrow('Blog category "ai" has conflicting labels');
  });
});

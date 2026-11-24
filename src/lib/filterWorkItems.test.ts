import { describe, expect, it } from 'vitest';
import type { BlogSummary } from '../schemas/blog';
import { filterWorkItems } from './filterWorkItems';

const items: BlogSummary[] = [
  {
    slug: 'leadership-playbook',
    date: '2026.10',
    type: 'CAREER PLAYBOOK',
    typeCategory: 'leadership',
    title: 'From Staff Engineer to Engineering Manager',
    tldr: 'Build tools to maintain technical intuition.',
    summary: 'A practical leadership guide.',
    readTime: '6 min read',
    artifacts: ['Leadership Guide'],
    featured: true,
  },
  {
    slug: 'ai-review',
    date: '2026.09',
    type: 'ARCHITECTURE',
    typeCategory: 'ai',
    title: 'Multi-Agent Code Review',
    tldr: 'A 3-tier review pipeline.',
    summary: 'Field notes from platform teams.',
    readTime: '8 min read',
    artifacts: ['TypeScript'],
    featured: true,
  },
];

describe('filterWorkItems', () => {
  it('filters by category and case-insensitive text across item summaries', () => {
    expect(filterWorkItems(items, 'leadership', 'TECHNICAL')).toEqual([items[0]]);
    expect(filterWorkItems(items, 'ai', 'FIELD NOTES')).toEqual([items[1]]);
  });

  it('returns no results when category and query do not match', () => {
    expect(filterWorkItems(items, 'prototypes', 'review')).toEqual([]);
  });
});

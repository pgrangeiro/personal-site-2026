import type { BlogData, BlogSummary } from '../schemas/blog';

type WorkCategory = BlogData['typeCategory'];

export function filterWorkItems(
  items: BlogSummary[],
  category: WorkCategory | 'all',
  query: string,
): BlogSummary[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesCategory = category === 'all' || item.typeCategory === category;
    const searchableText = `${item.title} ${item.summary} ${item.tldr}`.toLowerCase();

    return matchesCategory && searchableText.includes(normalizedQuery);
  });
}

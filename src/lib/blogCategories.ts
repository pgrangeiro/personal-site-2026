import type { BlogCategory } from '../schemas/blog';

export function getBlogCategories(
  posts: readonly { data: { category: BlogCategory } }[],
): BlogCategory[] {
  const categories = new Map<string, BlogCategory>();
  for (const { data } of posts) {
    const existing = categories.get(data.category.id);
    if (existing && existing.label !== data.category.label) {
      throw new Error(
        `Blog category "${data.category.id}" has conflicting labels: "${existing.label}" and "${data.category.label}".`,
      );
    }
    categories.set(data.category.id, data.category);
  }
  return [...categories.values()].sort((a, b) => a.label.localeCompare(b.label));
}

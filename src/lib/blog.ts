import { getCollection, type CollectionEntry } from 'astro:content';
import type { BlogSummary } from '../schemas/blog';
import { formatPublicationDate } from './formatPublicationDate';

export { formatPublicationDate } from './formatPublicationDate';
export { getBlogCategories } from './blogCategories';

export type BlogPost = CollectionEntry<'blog'>;

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function toBlogSummary(post: BlogPost): BlogSummary {
  const { data } = post;

  return {
    slug: post.id,
    date: formatPublicationDate(data.pubDate),
    type: data.type,
    category: data.category,
    title: data.title,
    tldr: data.tldr,
    summary: data.description,
    readTime: data.readTime,
    artifacts: data.artifacts,
    featured: data.featured,
  };
}

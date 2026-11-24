import { z } from 'astro/zod';

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  type: z.string(),
  typeCategory: z.enum(['leadership', 'ai', 'prototypes']),
  tldr: z.string(),
  readTime: z.string(),
  artifacts: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  githubUrl: z.url().optional(),
  hasInteractiveComponent: z.boolean().default(false),
});

export type BlogData = z.infer<typeof blogSchema>;

export type BlogSummary = Pick<
  BlogData,
  'type' | 'typeCategory' | 'title' | 'tldr' | 'readTime' | 'artifacts' | 'featured'
> & {
  slug: string;
  date: string;
  summary: string;
};

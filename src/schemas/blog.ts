import { z } from 'astro/zod';

export const BLOG_CATEGORY_IDS = ['leadership', 'ai', 'prototypes'] as const;

export const BLOG_CATEGORIES = [
  { id: 'leadership', label: 'Career Playbooks' },
  { id: 'ai', label: 'AI & Systems' },
  { id: 'prototypes', label: 'Prototypes & Tools' },
] as const satisfies readonly {
  id: (typeof BLOG_CATEGORY_IDS)[number];
  label: string;
}[];

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  type: z.string(),
  typeCategory: z.enum(BLOG_CATEGORY_IDS),
  tldr: z.string(),
  readTime: z.string(),
  artifacts: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  githubUrl: z.url().optional(),
  hasInteractiveComponent: z.boolean().default(false),
});

export type BlogData = z.infer<typeof blogSchema>;
export type BlogCategory = BlogData['typeCategory'];

export type BlogSummary = Pick<
  BlogData,
  'type' | 'typeCategory' | 'title' | 'tldr' | 'readTime' | 'artifacts' | 'featured'
> & {
  slug: string;
  date: string;
  summary: string;
};

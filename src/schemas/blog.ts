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

const artifactSchema = z.object({
  label: z.string().min(1),
  url: z
    .url()
    .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
      message: 'Artifact URLs must use HTTP or HTTPS.',
    })
    .optional(),
});

export const blogSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  type: z.string().min(1),
  typeCategory: z.enum(BLOG_CATEGORY_IDS),
  tldr: z.string().min(1),
  readTime: z.string().min(1),
  artifacts: z.array(artifactSchema).default([]),
  featured: z.boolean().default(false),
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

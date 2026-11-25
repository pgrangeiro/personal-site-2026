import { z } from 'astro/zod';

const blogCategorySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Category IDs must be lowercase kebab-case.',
  }),
  label: z.string().min(1),
});

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
  category: blogCategorySchema,
  tldr: z.string().min(1),
  readTime: z.string().min(1),
  artifacts: z.array(artifactSchema).default([]),
  featured: z.boolean().default(false),
  hasInteractiveComponent: z.boolean().default(false),
});

export type BlogData = z.infer<typeof blogSchema>;
export type BlogCategory = BlogData['category'];

export type BlogSummary = Pick<
  BlogData,
  'type' | 'category' | 'title' | 'tldr' | 'readTime' | 'artifacts' | 'featured'
> & {
  slug: string;
  date: string;
  summary: string;
};

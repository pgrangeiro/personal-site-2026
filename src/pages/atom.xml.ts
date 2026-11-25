import type { APIRoute } from 'astro';
import { createAtomFeed } from '../lib/atomFeed';
import { getBlogPosts } from '../lib/blog';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Configure `site` in astro.config.mjs to generate Atom feed URLs.');

  const posts = await getBlogPosts();
  const body = createAtomFeed(
    posts.map(({ id, data }) => ({
      slug: id,
      title: data.title,
      tldr: data.tldr,
      pubDate: data.pubDate,
    })),
    site,
  );

  return new Response(body, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  });
};

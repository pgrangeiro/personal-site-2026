import type { APIRoute } from 'astro';
import { getBlogPosts } from '../../lib/blog';

export const GET: APIRoute = async () => {
  const posts = await getBlogPosts();
  const searchIndex = posts.map(({ id, body, data }) => ({
    url: `/work/${id}/`,
    content: body,
    meta: {
      title: data.title,
      type: data.type,
      category: data.typeCategory,
      readTime: data.readTime,
      date: data.pubDate.toISOString().slice(0, 10),
      tldr: data.tldr.replace(/^TL;DR:\s*/i, ''),
      summary: data.description,
      artifacts: JSON.stringify(data.artifacts),
    },
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

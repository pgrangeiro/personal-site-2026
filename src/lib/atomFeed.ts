import { Feed } from 'feed';

export interface AtomFeedPost {
  slug: string;
  title: string;
  tldr: string;
  pubDate: Date;
}

export function createAtomFeed(posts: AtomFeedPost[], site: URL): string {
  const sortedPosts = [...posts].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  const feedUrl = new URL('/atom.xml', site).href;
  const feed = new Feed({
    title: 'Paula Grangeiro — Work & Notes',
    id: site.href,
    link: site.href,
    feed: feedUrl,
    feedLinks: { atom: feedUrl },
    description: 'Engineering leadership, team growth, and hands-on AI.',
    language: 'en',
    updated: sortedPosts[0]?.pubDate ?? new Date(0),
    author: {
      name: 'Paula Grangeiro',
      link: site.href,
    },
  });

  for (const post of sortedPosts) {
    const link = new URL(`/work/${encodeURI(post.slug)}/`, site).href;
    feed.addItem({
      title: post.title,
      id: link,
      link,
      date: post.pubDate,
      published: post.pubDate,
      description: post.tldr.replace(/^TL;DR:\s*/i, ''),
    });
  }

  return feed.atom1();
}

import { describe, expect, it } from 'vitest';
import { createAtomFeed, type AtomFeedPost } from './atomFeed';

const site = new URL('https://www.paulagrangeiro.com.br/');

function post(overrides: Partial<AtomFeedPost> = {}): AtomFeedPost {
  return {
    slug: 'sample-post',
    title: 'A practical post',
    tldr: 'TL;DR: A concise takeaway.',
    pubDate: new Date('2026-10-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('Atom feed', () => {
  it('creates Atom 1.0 entries with absolute URLs, dates, and TL;DR summaries', () => {
    const xml = createAtomFeed([post()], site);

    expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
    expect(xml).toContain('<id>https://www.paulagrangeiro.com.br/</id>');
    expect(xml).toContain('<link rel="self" href="https://www.paulagrangeiro.com.br/atom.xml"');
    expect(xml).toContain('<id>https://www.paulagrangeiro.com.br/work/sample-post/</id>');
    expect(xml).toContain('href="https://www.paulagrangeiro.com.br/work/sample-post/"');
    expect(xml).toContain('<summary type="html"><![CDATA[A concise takeaway.]]></summary>');
    expect(xml).not.toContain('<content');
  });

  it('keeps every entry sorted newest-first regardless of source order', () => {
    const xml = createAtomFeed(
      [
        post({ slug: 'older', title: 'Older entry', pubDate: new Date('2026-01-01T00:00:00.000Z') }),
        post({ slug: 'newer', title: 'Newer entry', pubDate: new Date('2026-11-01T00:00:00.000Z') }),
      ],
      site,
    );

    expect(xml.indexOf('Newer entry')).toBeLessThan(xml.indexOf('Older entry'));
  });
});

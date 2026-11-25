import { describe, expect, it } from 'vitest';
import { getPageCount, getPageItems, getPaginatedPages } from '../../../src/lib/pagination';

describe('static archive pagination', () => {
  it('splits a large collection into stable, non-overlapping pages', () => {
    const posts = Array.from({ length: 1_000 }, (_, index) => index);

    const pages = getPaginatedPages(posts, 20);

    expect(getPageCount(posts.length, 20)).toBe(50);
    expect(pages).toHaveLength(50);
    expect(pages[0]).toEqual({ page: 1, pageCount: 50, items: posts.slice(0, 20) });
    expect(pages[49]).toEqual({ page: 50, pageCount: 50, items: posts.slice(980) });
  });

  it('creates one archive page for an empty collection', () => {
    expect(getPageCount(0, 20)).toBe(1);
    expect(getPageItems([], 1, 20)).toEqual([]);
  });

  it('rejects invalid page sizes and page numbers', () => {
    expect(() => getPageCount(10, 0)).toThrow(RangeError);
    expect(() => getPageItems([1, 2], 2, 2)).toThrow(RangeError);
  });
});

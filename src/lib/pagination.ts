export const POSTS_PER_PAGE = 20;

export interface PaginatedPage<T> {
  page: number;
  pageCount: number;
  items: T[];
}

export function getPageCount(itemCount: number, pageSize = POSTS_PER_PAGE): number {
  if (!Number.isInteger(itemCount) || itemCount < 0) {
    throw new RangeError('Item count must be a non-negative integer.');
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('Page size must be a positive integer.');
  }

  return Math.max(1, Math.ceil(itemCount / pageSize));
}

export function getPageItems<T>(
  items: T[],
  page: number,
  pageSize = POSTS_PER_PAGE,
): T[] {
  const pageCount = getPageCount(items.length, pageSize);
  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    throw new RangeError(`Page must be an integer between 1 and ${pageCount}.`);
  }

  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getPaginatedPages<T>(
  items: T[],
  pageSize = POSTS_PER_PAGE,
): PaginatedPage<T>[] {
  const pageCount = getPageCount(items.length, pageSize);

  return Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;
    return {
      page,
      pageCount,
      items: getPageItems(items, page, pageSize),
    };
  });
}

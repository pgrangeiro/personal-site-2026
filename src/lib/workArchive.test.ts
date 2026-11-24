import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getArchiveUrl,
  initializeWorkArchive,
  readArchiveState,
  type PagefindArchiveApi,
} from './workArchive';

function createArchiveMarkup(): HTMLElement {
  document.body.innerHTML = `
    <div data-work-archive data-default-category="" data-default-page="1">
      <a data-archive-filter="" href="/work/">All</a>
      <a data-archive-filter="leadership" href="/work/category/leadership/">Leadership &amp; Growth</a>
      <input data-archive-search />
      <p data-archive-status></p>
      <section data-archive-results></section>
      <div data-archive-empty hidden>
        <button data-archive-reset type="button">Reset filters</button>
      </div>
      <p data-archive-error hidden></p>
      <nav data-archive-pagination hidden>
        <button data-archive-previous type="button"></button>
        <span data-archive-page-label></span>
        <button data-archive-next type="button"></button>
      </nav>
    </div>
  `;
  return document.querySelector<HTMLElement>('[data-work-archive]')!;
}

function createApi(posts: Array<Record<string, string>>): PagefindArchiveApi {
  return {
    search: vi.fn(async (query, options) => {
      const category = options.filters?.category;
      const filtered = posts.filter((post) => {
        const categoryMatches = !category || post.category === category;
        const normalizedQuery = query?.toLowerCase();
        const queryMatches =
          !normalizedQuery ||
          ['title', 'summary', 'tldr', 'artifacts']
            .some((key) => post[key]?.toLowerCase().includes(normalizedQuery));
        return categoryMatches && queryMatches;
      });

      return {
        results: filtered.map((meta) => ({
          data: async () => ({ url: `/work/${meta.slug}/`, meta }),
        })),
      };
    }),
  } as PagefindArchiveApi;
}

function post(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    title: 'Platform Leadership',
    type: 'CAREER PLAYBOOK',
    category: 'leadership',
    readTime: '5 min read',
    date: '2026-03-15',
    tldr: 'Build trust through clear ownership.',
    summary: 'A practical guide to engineering leadership.',
    artifacts: '[{"label":"Repository","url":"https://example.com/repo"}]',
    slug: 'platform-leadership',
    ...overrides,
  };
}

afterEach(() => {
  document.body.innerHTML = '';
  window.history.replaceState(null, '', '/work/');
});

describe('Work & Notes archive', () => {
  it('restores valid shareable category, query, and page state from the URL', () => {
    const state = readArchiveState(
      new URL('https://example.com/work/?category=ai&q=agents&page=3'),
      null,
      1,
    );

    expect(state).toEqual({ category: 'ai', query: 'agents', page: 3 });
    expect(getArchiveUrl(state)).toBe('/work/?category=ai&q=agents&page=3');
    expect(readArchiveState(new URL('https://example.com/work/?category=unknown&page=-1'), null, 1))
      .toEqual({ category: null, query: '', page: 1 });
  });

  it('filters titles, summaries, and artifact tags and shows a resettable empty state', async () => {
    window.history.replaceState(null, '', '/work/');
    const archive = createArchiveMarkup();
    const api = createApi([
      post(),
      post({
        title: 'AI Agent Review',
        type: 'ARCHITECTURE',
        category: 'ai',
        tldr: 'Review agents with measured evals.',
        summary: 'A code review workflow.',
        artifacts: '[{"label":"Eval Metrics"}]',
        slug: 'ai-agent-review',
      }),
    ]);

    await initializeWorkArchive(archive, async () => api);

    const search = archive.querySelector<HTMLInputElement>('[data-archive-search]')!;
    fireEvent.input(search, { target: { value: 'Platform' } });

    await waitFor(() => {
      expect(archive.querySelectorAll('[data-archive-results] article')).toHaveLength(1);
      expect(archive.querySelector('[data-archive-results] h3')).toHaveTextContent('Platform Leadership');
    });

    fireEvent.input(search, { target: { value: 'practical guide' } });
    await waitFor(() => {
      expect(archive.querySelector('[data-archive-results] h3')).toHaveTextContent('Platform Leadership');
    });

    fireEvent.input(search, { target: { value: 'metrics' } });

    await waitFor(() => {
      expect(archive.querySelectorAll('[data-archive-results] article')).toHaveLength(1);
      expect(archive.querySelector('[data-archive-results] h3')).toHaveTextContent('AI Agent Review');
      expect(archive.querySelector('[data-archive-results] div.pt-1')).toHaveTextContent(
        'Eval Metrics',
      );
      expect(window.location.search).toBe('?q=metrics');
    });

    fireEvent.input(search, { target: { value: 'no matching content' } });
    await waitFor(() => {
      expect(archive.querySelector('[data-archive-empty]')).not.toHaveAttribute('hidden');
      expect(archive.querySelector('[data-archive-results]')).toBeEmptyDOMElement();
    });

    fireEvent.click(archive.querySelector('[data-archive-reset]')!);
    await waitFor(() => {
      expect(search).toHaveValue('');
      expect(archive.querySelectorAll('[data-archive-results] article')).toHaveLength(2);
      expect(window.location.pathname + window.location.search).toBe('/work/');
    });
  });

  it('restores a shareable search and category from the URL on load', async () => {
    window.history.replaceState(null, '', '/work/?category=ai&q=agents');
    const archive = createArchiveMarkup();
    const api = createApi([
      post({
        title: 'AI Agent Review',
        type: 'ARCHITECTURE',
        category: 'ai',
        tldr: 'Review agents with measured evals.',
        summary: 'A code review workflow.',
        artifacts: '[{"label":"Eval Metrics"}]',
        slug: 'ai-agent-review',
      }),
      post(),
    ]);

    await initializeWorkArchive(archive, async () => api);

    expect(api.search).toHaveBeenCalledWith(
      'agents',
      { filters: { category: 'ai' }, sort: { date: 'desc' } },
    );
    expect(archive.querySelector('[data-archive-search]')).toHaveValue('agents');
    expect(archive.querySelectorAll('[data-archive-results] article')).toHaveLength(1);
    expect(archive.querySelector('[data-archive-results] h3')).toHaveTextContent('AI Agent Review');
  });

  it('applies category filters immediately and exposes paging for large result sets', async () => {
    window.history.replaceState(null, '', '/work/');
    const archive = createArchiveMarkup();
    const posts = Array.from({ length: 22 }, (_, index) =>
      post({
        title: `Leadership post ${index}`,
        slug: `leadership-${index}`,
      }),
    );
    posts.push(
      post({
        title: 'AI Prototype',
        type: 'PROTOTYPE',
        category: 'ai',
        slug: 'ai-prototype',
      }),
    );
    const api = createApi(posts);

    await initializeWorkArchive(archive, async () => api);
    fireEvent.click(archive.querySelector('[data-archive-filter="leadership"]')!);

    await waitFor(() => {
      expect(archive.querySelectorAll('[data-archive-results] article')).toHaveLength(20);
      expect(archive.querySelector('[data-archive-page-label]')).toHaveTextContent('Page 1 of 2');
      expect(window.location.search).toBe('?category=leadership');
    });

    fireEvent.click(archive.querySelector('[data-archive-next]')!);
    await waitFor(() => {
      expect(archive.querySelectorAll('[data-archive-results] article')).toHaveLength(2);
      expect(window.location.search).toBe('?category=leadership&page=2');
    });

    fireEvent.input(archive.querySelector('[data-archive-search]')!, {
      target: { value: 'no matching content' },
    });
    await waitFor(() => {
      expect(archive.querySelector('[data-archive-empty]')).not.toHaveAttribute('hidden');
    });
    fireEvent.click(archive.querySelector('[data-archive-reset]')!);
    await waitFor(() => {
      expect(archive.querySelectorAll('[data-archive-results] article')).toHaveLength(20);
      expect(window.location.pathname + window.location.search).toBe('/work/');
    });
  });

  it('restores a category route when browser history returns to its static URL', async () => {
    window.history.replaceState(null, '', '/work/category/ai/');
    const archive = createArchiveMarkup();
    archive.dataset.defaultCategory = 'ai';
    const api = createApi([post({ category: 'ai', slug: 'ai-post' }), post()]);

    await initializeWorkArchive(archive, async () => api);
    window.history.replaceState(null, '', '/work/');
    window.dispatchEvent(new PopStateEvent('popstate'));

    await waitFor(() => {
      expect(api.search).toHaveBeenLastCalledWith(
        null,
        { filters: { category: 'ai' }, sort: { date: 'desc' } },
      );
      expect(archive.querySelectorAll('[data-archive-results] article')).toHaveLength(1);
    });
  });
});

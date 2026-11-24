import { BLOG_CATEGORY_IDS, type BlogCategory } from '../schemas/blog';

const PAGE_SIZE = 20;

export interface ArchiveState {
  category: BlogCategory | null;
  query: string;
  page: number;
}

interface PagefindResultData {
  url: string;
  meta: Record<string, string | undefined>;
}

interface PagefindResult {
  data(): Promise<PagefindResultData>;
}

interface PagefindSearchResponse {
  results: PagefindResult[];
}

export interface PagefindArchiveApi {
  search(
    query: string | null,
    options: {
      filters?: { category: BlogCategory };
      sort: { date: 'desc' };
    },
  ): Promise<PagefindSearchResponse>;
}

type Artifact = {
  label: string;
  url?: string;
};

const categoryLabels: Record<BlogCategory, string> = {
  leadership: 'Leadership & Growth',
  ai: 'Hands-On & AI',
  prototypes: 'Prototypes',
};

export function readArchiveState(
  url: URL,
  defaultCategory: BlogCategory | null,
  defaultPage: number,
): ArchiveState {
  const categoryParam = url.searchParams.get('category');
  const category = BLOG_CATEGORY_IDS.includes(categoryParam as BlogCategory)
    ? (categoryParam as BlogCategory)
    : categoryParam === null
      ? defaultCategory
      : null;
  const pageParam = Number(url.searchParams.get('page'));

  return {
    category,
    query: url.searchParams.get('q') ?? '',
    page: Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : defaultPage,
  };
}

export function getArchiveUrl(state: ArchiveState): string {
  const url = new URL('/work/', window.location.origin);
  if (state.category) url.searchParams.set('category', state.category);
  if (state.query.trim()) url.searchParams.set('q', state.query.trim());
  if (state.page > 1) url.searchParams.set('page', String(state.page));
  return `${url.pathname}${url.search}`;
}

function getMetadataValue(meta: PagefindResultData['meta'], key: string): string {
  const value = meta[key];
  if (!value) throw new Error(`The search index is missing the "${key}" field.`);
  return value;
}

function getArtifacts(raw: string): Artifact[] {
  const parsed: unknown = JSON.parse(raw);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (artifact) =>
        typeof artifact === 'object' &&
        artifact !== null &&
        typeof artifact.label === 'string' &&
        (!('url' in artifact) || typeof artifact.url === 'string'),
    )
  ) {
    throw new Error('The search index contains invalid artifact metadata.');
  }
  return parsed;
}

function formatDate(rawDate: string): string {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) throw new Error('The search index contains an invalid publication date.');
  return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function createArtifactTag(artifact: Artifact): HTMLElement {
  const classes =
    'rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-[11px] text-muted';

  if (!artifact.url) {
    const tag = document.createElement('span');
    tag.className = classes;
    tag.textContent = artifact.label;
    return tag;
  }

  const url = new URL(artifact.url);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('The search index contains an artifact URL that is not HTTP or HTTPS.');
  }

  const tag = document.createElement('a');
  tag.className = `${classes} inline-flex items-center gap-1 transition-colors hover:border-terracotta hover:text-terracotta`;
  tag.href = url.href;
  tag.rel = 'noreferrer';
  tag.target = '_blank';
  tag.append(document.createTextNode(artifact.label));
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '↗';
  tag.append(icon);
  return tag;
}

function createPostCard(data: PagefindResultData): HTMLElement {
  const title = getMetadataValue(data.meta, 'title');
  const type = getMetadataValue(data.meta, 'type');
  const category = getMetadataValue(data.meta, 'category');
  if (!BLOG_CATEGORY_IDS.includes(category as BlogCategory)) {
    throw new Error(`The search index contains an unknown category "${category}".`);
  }
  const readTime = getMetadataValue(data.meta, 'readTime');
  const date = formatDate(getMetadataValue(data.meta, 'date'));
  const tldr = getMetadataValue(data.meta, 'tldr');
  const artifacts = getArtifacts(getMetadataValue(data.meta, 'artifacts'));
  const postUrl = new URL(data.url, window.location.origin);
  if (postUrl.origin !== window.location.origin || !postUrl.pathname.startsWith('/work/')) {
    throw new Error('The search index contains an invalid post URL.');
  }

  const card = document.createElement('article');
  card.className = 'group space-y-2 px-3 py-6 transition-colors hover:bg-sand/40';

  const metadata = document.createElement('div');
  metadata.className = 'flex flex-wrap items-center justify-between gap-2 font-mono text-xs';
  const categoryAndDate = document.createElement('div');
  categoryAndDate.className = 'flex items-center gap-2';
  const categoryLink = document.createElement('a');
  categoryLink.className =
    'rounded border border-hairline bg-sand px-2 py-0.5 font-bold text-terracotta transition-colors hover:border-terracotta hover:underline focus-visible:underline';
  categoryLink.href = `/work/category/${category}/`;
  categoryLink.setAttribute('aria-label', `View all ${categoryLabels[category as BlogCategory]} posts`);
  categoryLink.textContent = type;
  const dateLabel = document.createElement('span');
  dateLabel.className = 'text-muted';
  dateLabel.textContent = date;
  categoryAndDate.append(categoryLink, dateLabel);
  const readTimeLabel = document.createElement('span');
  readTimeLabel.className = 'text-muted';
  readTimeLabel.textContent = readTime;
  metadata.append(categoryAndDate, readTimeLabel);

  const heading = document.createElement('h3');
  heading.className =
    'font-editorial text-xl font-bold text-ink transition-colors group-hover:text-terracotta';
  const link = document.createElement('a');
  link.href = `${postUrl.pathname}${postUrl.search}${postUrl.hash}`;
  link.textContent = title;
  heading.append(link);

  const summary = document.createElement('p');
  summary.className = 'text-sm font-medium text-muted';
  summary.textContent = tldr;

  const artifactList = document.createElement('div');
  artifactList.className = 'flex flex-wrap gap-2 pt-1';
  for (const artifact of artifacts) artifactList.append(createArtifactTag(artifact));

  card.append(metadata, heading, summary, artifactList);
  return card;
}

async function loadPagefind(): Promise<PagefindArchiveApi> {
  const pagefindPath: string = '/pagefind/pagefind.js';
  const pagefind = await import(/* @vite-ignore */ pagefindPath);
  return pagefind as PagefindArchiveApi;
}

export async function initializeWorkArchive(
  root: HTMLElement,
  loadApi: () => Promise<PagefindArchiveApi> = loadPagefind,
): Promise<void> {
  function required<T extends Element>(element: T | null, selector: string): T {
    if (!element) throw new Error(`The Work & Notes archive is missing "${selector}".`);
    return element;
  }

  const resultsContainer = required(
    root.querySelector<HTMLElement>('[data-archive-results]'),
    '[data-archive-results]',
  );
  const searchInput = required(
    root.querySelector<HTMLInputElement>('[data-archive-search]'),
    '[data-archive-search]',
  );
  const status = required(root.querySelector<HTMLElement>('[data-archive-status]'), '[data-archive-status]');
  const errorMessage = required(
    root.querySelector<HTMLElement>('[data-archive-error]'),
    '[data-archive-error]',
  );
  const emptyState = required(
    root.querySelector<HTMLElement>('[data-archive-empty]'),
    '[data-archive-empty]',
  );
  const staticPagination = root.querySelector<HTMLElement>('[data-archive-static-pagination]');
  const dynamicPagination = required(
    root.querySelector<HTMLElement>('[data-archive-pagination]'),
    '[data-archive-pagination]',
  );
  const pageLabel = required(
    root.querySelector<HTMLElement>('[data-archive-page-label]'),
    '[data-archive-page-label]',
  );
  const previousButton = required(
    root.querySelector<HTMLButtonElement>('[data-archive-previous]'),
    '[data-archive-previous]',
  );
  const nextButton = required(
    root.querySelector<HTMLButtonElement>('[data-archive-next]'),
    '[data-archive-next]',
  );
  const resetButton = required(
    root.querySelector<HTMLButtonElement>('[data-archive-reset]'),
    '[data-archive-reset]',
  );
  const filterLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-archive-filter]'));

  const defaultCategoryValue = root.dataset.defaultCategory ?? '';
  const defaultCategory = BLOG_CATEGORY_IDS.includes(defaultCategoryValue as BlogCategory)
    ? (defaultCategoryValue as BlogCategory)
    : null;
  const defaultPage = Number(root.dataset.defaultPage);
  let state = readArchiveState(
    new URL(window.location.href),
    defaultCategory,
    Number.isSafeInteger(defaultPage) && defaultPage > 0 ? defaultPage : 1,
  );
  let requestId = 0;
  let api: PagefindArchiveApi;

  function updateControls(): void {
    searchInput.value = state.query;
    for (const link of filterLinks) {
      const active = link.dataset.archiveFilter === (state.category ?? '');
      link.classList.toggle('border-terracotta', active);
      link.classList.toggle('bg-terracotta', active);
      link.classList.toggle('font-bold', active);
      link.classList.toggle('text-white', active);
      link.classList.toggle('border-hairline', !active);
      link.classList.toggle('bg-sand', !active);
      link.classList.toggle('text-muted', !active);
      link.setAttribute('aria-current', active ? 'page' : 'false');
    }
  }

  async function renderResults(): Promise<void> {
    const currentRequestId = ++requestId;
    const response = await api.search(state.query.trim() || null, {
      ...(state.category ? { filters: { category: state.category } } : {}),
      sort: { date: 'desc' },
    });
    if (currentRequestId !== requestId) return;

    const resultCount = response.results.length;
    const pageCount = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
    if (state.page > pageCount) {
      state = { ...state, page: pageCount };
      window.history.replaceState(null, '', getArchiveUrl(state));
    }
    const start = (state.page - 1) * PAGE_SIZE;
    const pageResults = response.results.slice(start, start + PAGE_SIZE);
    const pageData = await Promise.all(pageResults.map((result) => result.data()));
    if (currentRequestId !== requestId) return;

    const cards = pageData.map(createPostCard);
    resultsContainer.replaceChildren(...cards);
    emptyState.hidden = resultCount !== 0;
    dynamicPagination.hidden = resultCount <= PAGE_SIZE;
    dynamicPagination.classList.add('flex');
    previousButton.disabled = state.page <= 1;
    nextButton.disabled = state.page >= pageCount;
    pageLabel.textContent = `Page ${state.page} of ${pageCount}`;
    if (staticPagination) staticPagination.hidden = true;
    status.textContent =
      resultCount === 0
        ? 'No posts match your filters.'
        : `Showing ${start + 1}–${start + pageData.length} of ${resultCount} posts.`;
    errorMessage.hidden = true;
    errorMessage.textContent = '';
    updateControls();
  }

  function showError(error: unknown): void {
    console.error('Unable to load Work & Notes search results.', error);
    errorMessage.textContent =
      'Interactive archive search could not be loaded. The statically generated archive is still available.';
    errorMessage.hidden = false;
  }

  try {
    api = await loadApi();
    await renderResults();
  } catch (error) {
    showError(error);
    return;
  }

  for (const link of filterLinks) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const category = link.dataset.archiveFilter ?? '';
      state = {
        category: BLOG_CATEGORY_IDS.includes(category as BlogCategory)
          ? (category as BlogCategory)
          : null,
        query: state.query,
        page: 1,
      };
      window.history.pushState(null, '', getArchiveUrl(state));
      updateControls();
      void renderResults().catch(showError);
    });
  }

  searchInput.addEventListener('input', () => {
    state = { ...state, query: searchInput.value, page: 1 };
    window.history.replaceState(null, '', getArchiveUrl(state));
    void renderResults().catch(showError);
  });

  previousButton.addEventListener('click', () => {
    if (state.page <= 1) return;
    state = { ...state, page: state.page - 1 };
    window.history.pushState(null, '', getArchiveUrl(state));
    void renderResults().catch(showError);
  });

  nextButton.addEventListener('click', () => {
    state = { ...state, page: state.page + 1 };
    window.history.pushState(null, '', getArchiveUrl(state));
    void renderResults().catch(showError);
  });

  resetButton.addEventListener('click', () => {
    state = { category: null, query: '', page: 1 };
    window.history.pushState(null, '', getArchiveUrl(state));
    updateControls();
    void renderResults().catch(showError);
  });

  window.addEventListener('popstate', () => {
    state = readArchiveState(new URL(window.location.href), defaultCategory, defaultPage);
    updateControls();
    void renderResults().catch(showError);
  });

  updateControls();
}

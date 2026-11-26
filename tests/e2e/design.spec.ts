import { expect, test, type Page } from '@playwright/test';

async function expectSharedShell(page: Page): Promise<void> {
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveCount(1);

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
}

async function openArticleFromArchive(page: Page): Promise<void> {
  await page.goto('/work/');
  await page.locator('[data-archive-results] article h3 a').first().click();
  await expect(page.locator('main > article')).toBeVisible();
}

test('shared shell and page canvas work across the core routes', async ({ page }) => {
  for (const route of ['/', '/work/', '/about/']) {
    await page.goto(route);
    await expectSharedShell(page);
  }

  await openArticleFromArchive(page);
  await expectSharedShell(page);

  const siteHeader = page.locator('body > div > header');
  await expect(siteHeader).toHaveCSS('position', 'sticky');
});

test('skip navigation is available from the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const skipLink = page.locator('a[href="#main-content"]');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('primary navigation changes routes and active state', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });

  await navigation.locator('a[href="/work"]').click();
  await expect(page).toHaveURL(/\/work\/?$/);
  await expect(navigation.locator('a[href="/work"]')).toHaveAttribute('aria-current', 'page');

  await navigation.locator('a[href="/about"]').click();
  await expect(page).toHaveURL(/\/about\/?$/);
  await expect(navigation.locator('a[href="/about"]')).toHaveAttribute('aria-current', 'page');
});

test('home hero and featured surface respond to viewport size', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('main section[aria-labelledby="home-heading"]');
  const columns = await hero.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
  );
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(columns).toBe(viewportWidth < 768 ? 1 : 2);

  const portrait = hero.locator('img');
  const portraitRatio = await portrait.evaluate((image) => {
    const { width, height } = image.getBoundingClientRect();
    return width / height;
  });
  expect(portraitRatio).toBeGreaterThan(0.95);
  expect(portraitRatio).toBeLessThan(1.05);
  await expect(portrait).toHaveCSS('object-fit', 'cover');

  const featuredSection = page.locator('section[aria-labelledby="featured-heading"]');
  await expect(featuredSection).toBeVisible();
  const featuredCard = featuredSection.locator('article').first();
  await expect(featuredCard).toBeVisible();
  const cornerRadius = await featuredCard.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).borderTopLeftRadius),
  );
  expect(cornerRadius).toBeGreaterThan(0);
});

test('archive controls wrap responsively and retain search and category interactions', async ({
  page,
}) => {
  await page.goto('/work/');

  const filters = page.locator('nav[aria-label="Filter work by category"]');
  const filterLinks = filters.locator('a');
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const flexWrap = await filters.evaluate((element) => getComputedStyle(element).flexWrap);
  if (viewportWidth < 640) {
    expect(flexWrap).toBe('wrap');
  } else {
    expect(flexWrap).toBe('nowrap');
  }

  const results = page.locator('[data-archive-results] article');
  const initialResultCount = await results.count();
  const search = page.getByRole('searchbox');
  await expect(search).toBeVisible();
  await search.fill(`e2e-no-match-${Date.now()}`);
  await expect(page.locator('[data-archive-empty]')).toBeVisible();
  await expect(results).toHaveCount(0);

  await page.locator('[data-archive-reset]').click();
  await expect(search).toHaveValue('');
  await expect(results).toHaveCount(initialResultCount);

  const categoryLink = filters.locator('a[href^="/work/category/"]').first();
  const categoryHref = await categoryLink.getAttribute('href');
  if (!categoryHref) throw new Error('Expected category filter to have a destination.');
  await categoryLink.click();

  await expect.poll(() => new URL(page.url()).searchParams.get('category')).not.toBeNull();
  const activeCategory = filters.locator('a[aria-current="page"]');
  await expect(activeCategory).toHaveCount(1);
  await expect(activeCategory).toHaveAttribute('href', categoryHref);
});

test('article content uses the editorial layout structure', async ({ page }) => {
  await openArticleFromArchive(page);

  const article = page.locator('main > article');
  const articleHeader = article.locator(':scope > header');
  await expect(articleHeader).toBeVisible();
  await expect(articleHeader.locator('time')).toHaveCount(1);
  await expect(articleHeader.locator('a[aria-label^="View all"]')).toHaveCount(1);
  await expect(articleHeader.locator('.border-l-4')).toBeVisible();
  await expect(article.locator('.article-body')).toBeVisible();
});

test('About panels and social icons reflow on mobile', async ({ page }) => {
  await page.goto('/about/');

  const aboutGrid = page.locator('main > div > div.grid').first();
  const columns = await aboutGrid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
  );
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(columns).toBe(viewportWidth < 768 ? 1 : 3);

  await expect(page.locator('section[aria-labelledby="current-focus"]')).toBeVisible();
  const socialNav = page.locator('nav[aria-label="Social profiles"]');
  await expect(socialNav).toBeVisible();
  await expect(socialNav.locator('i[aria-hidden="true"]')).toHaveCount(
    await socialNav.locator('a').count(),
  );
});

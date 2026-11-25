---
name: publish-blog-post
description: Create and validate a Markdown post for this Astro site's blog collection.
---

# Publish a Blog Post

Use this skill when adding a new article or project write-up to `src/content/blog/`.

## Create the post

1. Choose a lowercase kebab-case filename. It becomes the route at `/work/<filename>/`.
2. Write a Markdown file with the required frontmatter below. Do not use MDX.
3. Add a category object with a lowercase kebab-case ID and readable display label. Reuse the same label whenever a post uses an existing category ID.
4. Add artifacts as objects with a non-empty `label`. Add an absolute `http://` or `https://` `url` only when there is a real destination; label-only artifacts are supported.
5. Write the article body in Markdown. Use fenced code blocks with a language identifier for syntax highlighting.

````md
---
title: "A useful title"
description: "A short summary for listings and search engines."
pubDate: 2026-11-23
type: "CAREER PLAYBOOK"
category:
  id: leadership
  label: Career Playbooks
tldr: "A concise takeaway for the post."
readTime: "5 min read"
artifacts:
  - label: "Source repository"
    url: "https://github.com/example/project"
  - label: "Architecture diagram"
featured: false
---

Explain the problem, approach, and outcome.

```ts
const postPublished = true;
```
````

Required metadata includes `title`, `description`, `pubDate`, `type`, `category` (`id` and `label`), `tldr`, and `readTime`. The Astro content schema validates it during the build; invalid or missing required values fail the build. Category filters and static category routes are generated from category metadata in published posts. A category ID cannot be paired with multiple labels. `artifacts`, `featured`, and `hasInteractiveComponent` are optional. Setting `hasInteractiveComponent: true` renders the interactive prompt demo after the article.

## Verify before publishing

Run the relevant checks from the repository root:

```sh
pnpm test
pnpm check
pnpm build
```

The production build renders the post page, adds it to the work and category archives, and updates the Pagefind index. Verify `/work/<filename>/` in the generated site and check that linked artifacts and fenced code blocks render as expected. Code blocks use the site's dark `#141312` panel and can scroll horizontally on narrow screens.

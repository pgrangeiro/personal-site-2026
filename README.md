# Paula Grangeiro — Personal Site

Personal site built with Astro, React, TypeScript, and Tailwind CSS. Astro renders pages as static HTML; React is hydrated only for the interactive work index, prompt demo, and contact dialog.

## Requirements

- Node.js `24.x`
- pnpm (Corepack is included with Node.js)

Enable pnpm through Corepack if needed:

```sh
corepack enable
```

## Local development

Install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

Astro serves the site at [http://localhost:4321](http://localhost:4321).

## Tests and production build

Run the Vitest suite, check Astro/TypeScript diagnostics, and create the static production build and Pagefind search index:

```sh
pnpm test
pnpm check
pnpm build
```

The generated site and search index are written to `dist/`. Preview that build locally with:

```sh
pnpm preview
```

## Publishing a blog post

Create a Markdown file in `src/content/blog/`, using the filename as the post URL slug (for example, `my-new-post.md` becomes `/work/my-new-post/`). Astro validates each post's frontmatter against the blog collection schema and automatically includes it in the static article route, work archive, category archive, and Pagefind search index.

Start with this frontmatter:

````md
---
title: "A useful title"
description: "A short summary for listings and search engines."
pubDate: 2026-11-23
type: "CAREER PLAYBOOK"
typeCategory: leadership
tldr: "A concise takeaway for the post."
readTime: "5 min read"
artifacts:
  - label: "Source repository"
    url: "https://github.com/example/project"
  - label: "Architecture diagram"
featured: false
---

Write the post body here using Markdown. Fenced code blocks are highlighted at build time:

```ts
const postPublished = true;
```
````

`typeCategory` must be `leadership`, `ai`, or `prototypes`. Required metadata is validated when the collection is built; a missing or invalid required field fails `pnpm build` with a content validation error. `artifacts` and `featured` have defaults. Each artifact requires a `label` and may include an HTTP(S) `url`, which is rendered as an external link. `hasInteractiveComponent` is optional; set it to `true` to include the interactive AI workflow viewer after the post body. The viewer switches between the human spec, production system prompt, and evaluation output/diff, and its Copy button copies the currently selected view. Fenced code is syntax-highlighted by Shiki on the site's dark code surface and includes a Copy button. Article link previews use the post title and TL;DR summary. The filename determines the URL; no page or index edits are needed to publish a new post.

Before publishing, run the focused tests and production checks:

```sh
pnpm test
pnpm check
pnpm build
```

Work and category archives are statically generated in pages of 20 posts. Category links open `/work/category/<category>/`, with additional pages generated as needed. The Pagefind search UI is available on archive pages after `pnpm build` (the development server does not generate its index).

## Deploying with Vercel

1. Push this repository to GitHub and import it into Vercel.
2. Select Astro as the framework preset. Vercel should detect the project settings; use `pnpm build` as the build command and `dist` as the output directory if prompted.
3. Set the production branch to `main` and enable Vercel Git deployments. Commits pushed to `main` are then production deployments; branches and pull requests receive preview deployments.

The repository is configured for a static Astro build; the Vercel project/Git connection must be authorized in your Vercel account before pushes can deploy.

## Contact form

The contact dialog is a front-end preview only. It does not send or store messages, and the submit control stays disabled until an email or backend delivery method is configured.

---
title: "How I built and shipped my personal site within 2 Hours using AI free quotas"
description: "A practical account of designing, building, and hardening a personal site in two focused hours with Gemini and GitHub Copilot."
pubDate: 2026-11-25
type: "BUILD JOURNAL"
category:
  id: ai
  label: "AI & Systems"
tldr: "A prototype-led, story-by-story workflow let me ship a personal site in two focused hours, then use a next-day pass for refactoring, E2E tests, and CI."
readTime: "8 min read"
featured: true
artifacts:
  - label: "Source repository"
    url: "https://github.com/pgrangeiro/personal-site-2026"
---

Most personal websites die in a local folder because we jump straight into code without a clear product direction — or skip the engineering rigor needed to actually ship. Instead of spending weekends debating frameworks, I broke the build into a focused **2-hour sprint** followed by a **next-day hardening pass**, using **Gemini** for product/UX design and **GitHub Copilot Fusion** for implementation:

1. **Hour 1 (Product, UX & Prototype with free Gemini quota):** Defining the audience, using AI to challenge my layout, building an interactive prototype, and generating dependency-ordered user stories.
2. **Hour 2 (Incremental build with free Copilot quota):** Exporting the Gemini prototype as a baseline, planning and implementing one user story at a time using detailed user stories as my implementation specs — spending **50 of my 200 Copilot quota**.
3. **The next day (Hardening & Production launch):** Refactoring AI-generated code, pruning unnecessary design components, replacing stub text, adding E2E tests, CI, and wiring up deployment to Vercel — pushing my quota usage to **almost the full 200**.

Here is how the full workflow played out.

### The $0 Stack

- **Product, UX and interactive prototype:** Gemini
- **Code implementation and refactoring:** GitHub Copilot Fusion (VS Code, 200 quota budget)
- **Architecture, testing and hosting:** React + Atom, E2E tests with Playwright, GitHub CI, and Vercel

### Hour 1: Designing like a Product Team (before touching code)

My goal was specific: build a site for **software engineers growing into leadership** while proving that I remain a **hands-on builder**. Instead of asking for code right away, I kept the first hour strictly focused on design and product scope.

**1. Escaping "Portfolio Template Syndrome" (0–35 min)**

I started challenging Gemini to define the design before jumping into code, opting for a technical notebook aesthetic rather than dark-mode hacker clichés.

After generating an initial prototype , I asked Gemini to put on a **Senior UX Designer** hat and critique it. That single prompt caught major flaws even before I created a repository.

Gemini regenerated the interactive prototype with these UX upgrades applied, giving me a working visual reference.

**2. Turning UX decisions into User Stories (35–60 min)**

Once the prototype felt right, I switched hats again:

> _"Now, as product owner, create user stories for this project implementation. Output title and description, including acceptance criteria, ordered by dependencies. Do not focus on technical implementation."_

This produced a dependency-sequenced backlog covering the global navigation shell, post view, unified filterable index and homepage, and the About page.

### Hour 2: Planning, verifying, and pushing story by story (50/200 Quota Used)

Instead of prompting VS Code from a blank slate, I **exported the code from the Gemini prototype** into my local workspace as the visual and structural baseline.

**I don't write heavyweight formal specs — for me, detailed user stories _are_ the implementation specs.** Concrete user value paired with clear acceptance criteria tells me — and AI — exactly what behavior to build and verify without locking implementation details in concrete upfront.

Rather than dumping the entire backlog into one giant prompt, I worked through the dependency order **one user story at a time**:

1. **Plan the story:** Take a single story and use its acceptance criteria as the spec to map onto the exported prototype components with GitHub Copilot.
2. **Implement & verify:** Build just enough to satisfy that story's acceptance criteria, run tests, and double-check the UI, interactions, and responsiveness against the prototype.
3. **Commit & push:** Once a story passed my check, I pushed it before moving to the next dependency.

By working story by story against an existing prototype baseline, I finished Hour 2 with a locally verified build pushed to GitHub and spent only **50 of my 200 Copilot quota**.

### The Next Day: Refactoring, E2E Tests, and CI (~200 / 200 Quota Used)

Fast AI scaffolding gets you a working feature set quickly, but turning a prototype-derived codebase into something you're proud to maintain requires a deliberate engineering pass. The next day, I focused on polishing steps — and burned through the remaining quota (reaching **almost 200**) while iterating and testing:

- **Refactoring and trimming design components:** Exported prototypes often carry extra wrapper components, inline styles, or UI elements that look clever in a mockup but don't make sense in real daily use. I simplified the component tree, removed components that didn't earn their place, and cleaned up shared state.
- **Removing stub text:** I audited every route, card, and modal to strip out leftover placeholder copy from the prototype so only real writing and metadata remained.
- **Adding end-to-end (E2E) tests:** After being satisfied with the layout, Copilot helped me writing E2E tests covering the critical user journeys from my acceptance criteria.
- **CI:** Finally, I wired up the GitHub pipeline so every push runs the test suite (unit & E2E) on every main branch change.

### Three takeaways if you try this yourself

- **Export your prototype as your coding baseline:** Giving an IDE assistant an exported UI prototype eliminates layout drift and CSS guesswork.
- **Let detailed user stories act as your implementation specs:** Sharp acceptance criteria keep scope focused and give both you and AI clear done definitions without spec bloat.
- **Budget your free quota intentionally:** Working story by story kept initial implementation to 50/200 quota, saving most of the allowance for Day-2 refactoring, E2E test authoring, and CI polish.

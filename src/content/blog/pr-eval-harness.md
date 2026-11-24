---
title: "PR-Eval Harness v0.4: Benchmarking LLM Precision on Repo Diffs"
description: "A complete architectural breakdown and open-source harness that evaluates whether automated coding agent PRs adhere to team boundary rules before human review."
pubDate: 2026-11-01
type: "PROTOTYPE & ARTICLE"
typeCategory: prototypes
tldr: "TL;DR: How a 140-line AST + LLM evaluation pipeline reduced pull request architectural regressions by 94%."
readTime: "7 min read"
artifacts:
  - label: "Repo + Eval Metrics"
    url: "https://github.com/pgrangeiro/pr-eval-harness"
  - label: Python
  - label: Claude API
featured: true
hasInteractiveComponent: true
---

When engineers transition into management in 2026, autonomous AI agents are drafting over 40% of standard repository pull requests.

If engineering leaders don't stay hands-on with evaluation harnesses, they cannot evaluate whether software architecture is being guided by sound engineering or hallucinated agent shortcuts.

### The Problem: Architectural Drift from Automated PRs

Raw LLMs are fast at writing local function bodies, but notoriously prone to breaking **architectural isolation boundaries**—such as importing backend service logic into frontend components or violating linter contracts.

Rather than relying solely on human review, we built a **2-tier evaluation pipeline** that runs in CI/CD:

1. **Tree-sitter AST Parser:** Extracts affected imports and module boundaries.
2. **LLM Evaluator:** Scores the PR against vector-embedded Architecture Decision Records (ADRs).

Below is the exact evolution from a naive prompt attempt to our production evaluation prompt and output diff parser.

For example, an architectural check can flag database imports in UI modules before a pull request reaches human review:

```python
def crosses_ui_boundary(import_path: str) -> bool:
    return import_path.startswith("database.")
```

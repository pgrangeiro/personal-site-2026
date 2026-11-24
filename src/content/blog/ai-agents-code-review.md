---
title: "Multi-Agent Triage Pipeline for Code Reviews: Field Notes from 4 Squads"
description: "A step-by-step breakdown of our domain-specialized agentic review pipeline, highlighting psychological safety benefits for junior engineers."
pubDate: 2026-09-01
type: ARCHITECTURE
typeCategory: ai
tldr: "TL;DR: A 3-tier review pipeline that saved 14 hours per engineer per week while maintaining high security standards."
readTime: "8 min read"
artifacts:
  - Architecture Diagram
  - TypeScript
  - Slack Bot
featured: true
---

Code review is often where team velocity goes to die. Between waiting for timezone handoffs and shallow "LGTM" comments, senior engineers waste hours context-switching.

Three months ago, we rolled out an experimental **Agentic Review Harness** across 4 platform squads. Here is what we learned about human-AI collaboration in critical codebases.

### Architecture of an Agentic Review Pipeline

Rather than throwing a single raw LLM prompt at a 500-line diff, we built a 3-tier pipeline using domain-specialized lightweight models:

* **Tier 1: Static AST & Security Guard** - Scans for leaked secrets, missing error boundaries, and API breaking changes in < 3 seconds.
* **Tier 2: Business Logic Specialist** - Ingests the associated ticket and architecture documentation to verify logic intent.
* **Tier 3: Human Synthesizer** - Summarizes findings into a concise 3-bullet comment for human reviewers.

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

const tabs = [
  { id: 'spec', label: 'Spec', filename: 'human_spec.md', summary: 'Human requirements' },
  {
    id: 'systemPrompt',
    label: 'System Prompt',
    filename: 'production_system_prompt.py',
    summary: 'Enforces architecture boundaries',
  },
  {
    id: 'outputDiff',
    label: 'Output & Diff',
    filename: 'eval_output_and_diff.md',
    summary: 'Rejected before human review',
  },
] as const;

type PromptTab = (typeof tabs)[number]['id'];

const systemPrompt = `SYSTEM_PROMPT = """
You are an Automated Architectural Evaluation Agent.
Your duty is to enforce structural boundaries defined in /docs/adr/*.md.

INPUT DATA:
1. Parse Tree-sitter AST diff payload.
2. Filtered list of modified imports.

CONSTRAINTS:
- NEVER allow UI modules to import database driver functions directly.
- IF an import crosses domain boundary, output 'REJECT: Isolation Violation'.
- Return output strictly as JSON conforming to EvalResult Schema v2.
"""`;

const promptContent: Record<PromptTab, string> = {
  spec: `PURPOSE
Review pull request changes for architectural boundary violations before merge.

REQUIREMENTS
- UI components must use the API client and must not import database drivers.
- Evaluate changed imports against the ADRs in /docs/adr/*.md.
- For each violation, report the file, line, rule, and a concise remediation.
- Reject any pull request that violates a required boundary.`,
  systemPrompt,
  outputDiff: `EVALUATION RESULT
{
  "evaluation_id": "eval_8849a",
  "approved": false,
  "confidence_score": 0.96,
  "violations": [
    {
      "file": "src/components/UserAvatar.tsx",
      "line": 14,
      "rule": "ADR-004: UI components must fetch via API client, not directly from postgres_pool",
      "action": "Blocked pull request merge and opened automated remediation draft."
    }
  ]
}

REMEDIATION DIFF
diff --git a/src/components/UserAvatar.tsx b/src/components/UserAvatar.tsx
--- a/src/components/UserAvatar.tsx
+++ b/src/components/UserAvatar.tsx
@@ -1,2 +1,2 @@
-import { postgresPool } from "../database/postgresPool";
+import { userApi } from "../api/userApi";`,
};

export default function PromptDemo() {
  const [activeTab, setActiveTab] = useState<PromptTab>('spec');
  const [copyStatus, setCopyStatus] = useState('');
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const copyTimeoutRef = useRef<number | null>(null);
  const activeTabDetails = tabs.find((tab) => tab.id === activeTab);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
    },
    [],
  );

  function activateTab(tab: PromptTab) {
    setActiveTab(tab);
    setCopyStatus('');
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    activateTab(tabs[nextIndex].id);
    tabButtonRefs.current[nextIndex]?.focus();
  }

  function showCopyStatus(status: string) {
    setCopyStatus(status);
    if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus('');
      copyTimeoutRef.current = null;
    }, 1800);
  }

  async function copyActiveView() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable.');
      await navigator.clipboard.writeText(promptContent[activeTab]);
      showCopyStatus('Copied!');
    } catch (error) {
      console.error('Unable to copy the active workflow view.', error);
      showCopyStatus('Copy failed.');
    }
  }

  return (
    <section
      aria-label="Interactive AI workflow comparison"
      className="my-10 min-w-0 max-w-full overflow-hidden rounded-2xl border border-hairline bg-ink text-paper shadow-md"
    >
      <header className="flex flex-col justify-between gap-2 border-b border-[#3D3A36] bg-[#2A2825] p-4 sm:flex-row sm:items-center">
        <h2 className="font-mono text-[10px] font-bold sm:text-xs">
          AI WORKFLOW: SPEC → PROMPT → OUTPUT & DIFF
        </h2>
        <span className="font-mono text-[10px] text-muted-light sm:text-[11px]">
          Inspect each step
        </span>
      </header>

      <div
        aria-label="AI workflow views"
        className="grid min-w-0 grid-cols-3 bg-[#22201D] font-mono text-[10px] sm:text-xs"
        aria-orientation="horizontal"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              aria-controls="workflow-viewer-panel"
              aria-selected={isActive}
              className={`min-w-0 whitespace-normal break-words border-r border-[#3D3A36] px-1 py-3 text-center leading-tight transition-colors last:border-r-0 sm:px-2 ${
                isActive
                  ? 'border-b-2 border-b-terracotta bg-ink font-bold text-terracotta'
                  : 'text-muted-light hover:text-paper'
              }`}
              id={`workflow-viewer-tab-${tab.id}`}
              key={tab.id}
              onClick={() => activateTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              ref={(element) => {
                tabButtonRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`workflow-viewer-tab-${activeTab}`}
        className="min-w-0 max-w-full space-y-4 p-3 font-mono text-xs sm:p-5 sm:text-sm"
        id="workflow-viewer-panel"
        role="tabpanel"
        tabIndex={0}
      >
        <div className="flex min-w-0 flex-col gap-3 text-muted-light sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="min-w-0 break-all">{activeTabDetails?.filename}</span>
            <span className="text-[10px] sm:text-[11px]">{activeTabDetails?.summary}</span>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
            <span aria-live="polite" className="text-[11px]" role="status">
              {copyStatus}
            </span>
            <button
              className="rounded border border-[#3D3A36] bg-[#2A2825] px-2.5 py-1.5 text-[11px] text-paper transition-colors hover:border-terracotta hover:text-terracotta"
              onClick={copyActiveView}
              type="button"
            >
              Copy
            </button>
          </div>
        </div>
        <pre className="max-w-full overflow-x-auto rounded-lg border border-[#333] bg-[#141312] p-3 leading-relaxed text-sand sm:p-4">
          {promptContent[activeTab]}
        </pre>
      </div>
    </section>
  );
}

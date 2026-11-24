import { useState } from 'react';

type PromptTab = 'naivePrompt' | 'systemPrompt' | 'outputDiff';

const tabs: { id: PromptTab; label: string }[] = [
  { id: 'naivePrompt', label: '1. Naive Raw Prompt' },
  { id: 'systemPrompt', label: '2. Production Harness' },
  { id: 'outputDiff', label: '3. Resulting Eval' },
];

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
  naivePrompt: `"Review this GitHub pull request diff. Look for bugs and clean up the code.
If there are any bad dependencies or bad imports, tell me."`,
  systemPrompt: systemPrompt,
  outputDiff: `{
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
}`,
};

export default function PromptDemo() {
  const [activeTab, setActiveTab] = useState<PromptTab>('naivePrompt');
  const [copyStatus, setCopyStatus] = useState('');

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(systemPrompt);
      setCopyStatus('System prompt copied.');
    } catch {
      setCopyStatus('Clipboard unavailable. Select and copy the prompt above.');
    }
  }

  return (
    <section
      aria-label="Interactive prompt harness and evaluation comparison"
      className="my-10 overflow-hidden rounded-2xl border border-hairline bg-ink text-paper shadow-md"
    >
      <header className="flex flex-col justify-between gap-2 border-b border-[#3D3A36] bg-[#2A2825] p-4 sm:flex-row sm:items-center">
        <h2 className="font-mono text-xs font-bold">
          INTERACTIVE PROMPT HARNESS & EVAL COMPARISON
        </h2>
        <span className="font-mono text-[11px] text-muted-light">
          Inspect the prompt evolution
        </span>
      </header>

      <div aria-label="Prompt examples" className="grid grid-cols-3 bg-[#22201D] font-mono text-[11px] sm:text-xs" role="tablist">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`border-r border-[#3D3A36] px-2 py-3 transition-colors last:border-r-0 ${
              activeTab === tab.id
                ? 'border-b-2 border-b-terracotta bg-ink font-bold text-terracotta'
                : 'text-muted-light hover:text-paper'
            }`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-5 font-mono text-xs sm:text-sm">
        <div className="flex items-center justify-between gap-3 text-muted-light">
          <span>
            {activeTab === 'naivePrompt'
              ? 'naive_prompt.txt'
              : activeTab === 'systemPrompt'
                ? 'production_system_prompt.py'
                : 'eval_result_output.json'}
          </span>
          <span>
            {activeTab === 'naivePrompt'
              ? 'Low context'
              : activeTab === 'systemPrompt'
                ? 'Enforces architecture boundaries'
                : 'Rejected before human review'}
          </span>
        </div>
        <pre
          aria-live="polite"
          className="overflow-x-auto rounded-lg border border-[#333] bg-[#141312] p-4 leading-relaxed text-sand"
          role="tabpanel"
        >
          {promptContent[activeTab]}
        </pre>
        {activeTab === 'systemPrompt' && (
          <div className="flex items-center justify-between gap-3">
            <button
              className="text-xs text-terracotta hover:underline"
              onClick={copyPrompt}
              type="button"
            >
              Copy system prompt
            </button>
            <span aria-live="polite" className="text-xs text-muted-light">
              {copyStatus}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

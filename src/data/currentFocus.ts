type ReadingItem = {
  title: string;
  note?: string;
};

const reading: ReadingItem[] = [
  { title: 'Designing Data-Intensive Applications', note: 'Re-reading Chapter 8' },
  { title: 'High Output Management' },
];

export const currentFocus = {
  updatedAt: '2026-11-23',
  buildingWithAI:
    'Iterating on PR-Eval Harness v0.4 to benchmark AI-generated pull requests against repository architecture and team boundaries.',
  leadingAndMentoring:
    'Structuring senior 1:1s around career strategy and architectural diagramming or pairing.',
  reading,
} as const;

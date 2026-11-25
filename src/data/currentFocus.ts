type ReadingItem = {
  title: string;
};

const reading: ReadingItem[] = [
  {
    title:
      "Building Applications with AI Agents: Designing and Implementing Multiagent Systems",
  },
  {
    title:
      "Ordinary Men: Reserve Police Battalion 101 and the Final Solution in Poland",
  },
];

export const currentFocus = {
  updatedAt: "2026-11-23",
  building:
    "Financial systems that move, store, and reconcile money securely at scale.",
  leadingAndMentoring:
    "Mentoring 6~12 engineers around career, soft skills and technical expertise.",
  reading,
} as const;

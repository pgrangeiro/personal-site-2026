import { useMemo, useState } from 'react';
import type { BlogData, BlogSummary } from '../schemas/blog';
import { filterWorkItems } from '../lib/filterWorkItems';

interface WorkIndexProps {
  items: BlogSummary[];
}

type WorkCategory = BlogData['typeCategory'];

const categories: { id: WorkCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'leadership', label: 'Career Playbooks' },
  { id: 'ai', label: 'AI & Systems' },
  { id: 'prototypes', label: 'Prototypes & Tools' },
];

export default function WorkIndex({ items }: WorkIndexProps) {
  const [category, setCategory] = useState<WorkCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const filteredItems = useMemo(
    () => filterWorkItems(items, category, query),
    [items, category, query],
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div
          aria-label="Filter work by category"
          className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0"
        >
          {categories.map((item) => (
            <button
              aria-pressed={category === item.id}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                category === item.id
                  ? 'border-terracotta bg-terracotta font-bold text-white'
                  : 'border-hairline bg-sand text-muted hover:text-ink'
              }`}
              key={item.id}
              onClick={() => setCategory(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="relative block min-w-52">
          <span className="sr-only">Search work and notes</span>
          <input
            className="w-full rounded-full border border-hairline bg-paper py-2 pl-4 pr-4 font-mono text-xs text-ink placeholder:text-muted focus:border-terracotta focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search index..."
            type="search"
            value={query}
          />
        </label>
      </div>

      <div aria-live="polite" className="space-y-4">
        {filteredItems.length === 0 ? (
          <p className="py-12 text-center font-mono text-sm text-muted">
            No notebook entries match your criteria.
          </p>
        ) : (
          filteredItems.map((item) => (
            <article
              className="group space-y-3 rounded-2xl border border-hairline bg-paper p-6 transition hover:border-terracotta"
              key={item.slug}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="rounded border border-hairline bg-sand px-2 py-0.5 font-bold text-terracotta">
                    {item.type}
                  </span>
                  <span className="font-semibold text-muted">{item.date}</span>
                </div>
                <span className="text-muted">{item.readTime}</span>
              </div>

              <h2 className="font-editorial text-xl font-bold text-ink transition-colors group-hover:text-terracotta">
                <a className="focus-visible:rounded-sm" href={`/work/${item.slug}`}>
                  {item.title}
                </a>
              </h2>

              <p className="rounded-lg border-l-2 border-terracotta bg-sand/50 p-2.5 text-sm font-medium text-ink">
                {item.tldr}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {item.artifacts.map((artifact) => (
                  <span
                    className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-[11px] text-muted"
                    key={artifact}
                  >
                    {artifact}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

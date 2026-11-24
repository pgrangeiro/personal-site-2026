import { useEffect, useState } from 'react';
import { Coffee, X } from 'lucide-react';

type ContactIntent = 'leadership' | 'ai-workflows' | 'hello';

const intents: { id: ContactIntent; label: string }[] = [
  { id: 'leadership', label: 'Ask a Leadership / EM Question' },
  { id: 'ai-workflows', label: 'Compare AI Developer Workflows' },
  { id: 'hello', label: 'Say Hello / General Networking' },
];

export default function ContactExperience() {
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState<ContactIntent>('leadership');

  useEffect(() => {
    function handleContactTrigger(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;

      const trigger = event.target.closest<HTMLElement>('[data-open-contact]');
      if (!trigger) return;

      const selectedIntent = intents.find((option) => option.id === trigger.dataset.contactIntent);
      setIntent(selectedIntent?.id ?? 'leadership');
      setIsOpen(true);
    }

    document.addEventListener('click', handleContactTrigger);
    return () => document.removeEventListener('click', handleContactTrigger);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-2 font-mono text-xs font-semibold text-paper transition-colors hover:bg-[#B24D28]"
        onClick={() => {
          setIntent('leadership');
          setIsOpen(true);
        }}
        type="button"
      >
        <Coffee aria-hidden="true" size={15} />
        Coffee Chat
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            aria-labelledby="contact-title"
            aria-modal="true"
            className="relative w-full max-w-lg space-y-6 rounded-2xl border border-hairline bg-paper p-6 text-ink shadow-2xl sm:p-8"
            role="dialog"
          >
            <header className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-2">
                <Coffee aria-hidden="true" className="text-terracotta" size={20} />
                <h2 className="font-editorial text-xl font-bold" id="contact-title">
                  Start a Coffee Chat
                </h2>
              </div>
              <button
                aria-label="Close contact dialog"
                className="text-muted transition-colors hover:text-ink"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </header>

            <div className="space-y-3">
              <label className="block font-mono text-xs font-bold uppercase text-terracotta">
                What would you like to talk about?
              </label>
              <div className="grid gap-2">
                {intents.map((option) => (
                  <button
                    aria-pressed={intent === option.id}
                    className={`rounded-lg border p-3 text-left font-mono text-xs transition-colors ${
                      intent === option.id
                        ? 'border-terracotta bg-sand font-bold text-ink'
                        : 'border-hairline bg-paper text-muted hover:border-terracotta/50'
                    }`}
                    key={option.id}
                    onClick={() => setIntent(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block font-mono text-xs font-bold uppercase text-terracotta" htmlFor="contact-message">
                Your message
              </label>
              <textarea
                className="w-full resize-y rounded-lg border border-hairline bg-paper p-3 text-sm text-ink placeholder:text-muted focus:border-terracotta focus:outline-none"
                id="contact-message"
                placeholder="Share a little context for the conversation."
                rows={4}
              />
              <label className="block font-mono text-xs font-bold uppercase text-terracotta" htmlFor="contact-email">
                Your email
              </label>
              <input
                className="w-full rounded-lg border border-hairline bg-paper p-3 text-sm text-ink placeholder:text-muted focus:border-terracotta focus:outline-none"
                id="contact-email"
                placeholder="you@company.com"
                type="email"
              />
            </div>

            <div className="space-y-3">
              <p className="rounded-lg border border-hairline bg-sand p-3 text-xs leading-relaxed text-muted">
                Message delivery is not connected yet. This preview will not send or store your message.
              </p>
              <button
                className="w-full cursor-not-allowed rounded-lg bg-muted px-4 py-3 font-mono text-xs font-bold text-paper"
                disabled
                type="button"
              >
                Contact form not configured
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

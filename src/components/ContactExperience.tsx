import { useEffect, useRef, useState, type SubmitEvent as ReactSubmitEvent } from 'react';
import { Coffee, X } from 'lucide-react';

type ContactIntent = 'leadership' | 'ai-workflows' | 'hello';
type ContactField = 'name' | 'email' | 'message';
type ContactValues = Record<ContactField, string>;
type ContactErrors = Partial<Record<ContactField, string>>;

const recipient = 'contato@paulagrangeiro.com.br';

const intents: { id: ContactIntent; label: string; prompt: string }[] = [
  {
    id: 'leadership',
    label: 'Ask a leadership question',
    prompt:
      'For example: I’m preparing for my first engineering leadership role and would value your advice on...',
  },
  {
    id: 'ai-workflows',
    label: 'Compare AI dev workflows',
    prompt:
      'For example: Our team is exploring AI coding workflows. What approaches have you tried for...',
  },
  {
    id: 'hello',
    label: 'Say hello',
    prompt:
      'For example: I found your site through... and I’m currently working on...',
  },
];

const emptyValues: ContactValues = { name: '', email: '', message: '' };

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address, such as you@example.com.';
  }
  if (!values.message.trim()) errors.message = 'Please add a message so Paula knows what is on your mind.';
  return errors;
}

function createMailto(intentLabel: string, values: ContactValues): string {
  const params = new URLSearchParams({
    subject: `Coffee Chat: ${intentLabel}`,
    body: `Name: ${values.name.trim()}\nEmail: ${values.email.trim()}\nTopic: ${intentLabel}\n\n${values.message.trim()}`,
  });
  return `mailto:${recipient}?${params.toString()}`;
}

export default function ContactExperience() {
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState<ContactIntent>('leadership');
  const [values, setValues] = useState<ContactValues>(emptyValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [deliveryNotice, setDeliveryNotice] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleContactTrigger(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;

      const trigger = event.target.closest<HTMLElement>('[data-open-contact]');
      if (!trigger) return;

      const selectedIntent = intents.find((option) => option.id === trigger.dataset.contactIntent);
      setIntent(selectedIntent?.id ?? 'leadership');
      setErrors({});
      setDeliveryNotice(false);
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

  function updateField(field: ContactField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setDeliveryNotice(false);
  }

  function submitForm(event: ReactSubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setDeliveryNotice(false);

    if (nextErrors.name) {
      nameInput.current?.focus();
    } else if (nextErrors.email) {
      emailInput.current?.focus();
    } else if (nextErrors.message) {
      messageInput.current?.focus();
    } else {
      setDeliveryNotice(true);
    }
  }

  const selectedIntent = intents.find((option) => option.id === intent) ?? intents[0];
  const fieldClass = (field: ContactField) =>
    `w-full rounded-lg border bg-paper p-3 text-sm text-ink placeholder:text-muted focus:border-terracotta focus:outline-none ${
      errors[field] ? 'border-terracotta' : 'border-hairline'
    }`;

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 font-mono text-xs font-semibold text-paper shadow-xs transition-all hover:bg-[#B24D28]"
        onClick={() => {
          setIntent('leadership');
          setErrors({});
          setDeliveryNotice(false);
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
            className="relative max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-2xl border border-hairline bg-paper p-6 text-ink shadow-2xl sm:p-8"
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

            <form aria-label="Coffee Chat contact form" className="space-y-5" noValidate onSubmit={submitForm}>
              <fieldset className="space-y-3">
                <legend className="mb-3 block font-mono text-xs font-bold uppercase text-terracotta">
                  What would you like to talk about?
                </legend>
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
                      onClick={() => {
                        setIntent(option.id);
                        setDeliveryNotice(false);
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-bold uppercase text-terracotta" htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    aria-invalid={Boolean(errors.name)}
                    autoComplete="name"
                    className={fieldClass('name')}
                    id="contact-name"
                    name="name"
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Your name"
                    ref={nameInput}
                    value={values.name}
                  />
                  {errors.name && <p className="text-xs text-terracotta" id="contact-name-error" role="alert">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-bold uppercase text-terracotta" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    aria-invalid={Boolean(errors.email)}
                    autoComplete="email"
                    className={fieldClass('email')}
                    id="contact-email"
                    name="email"
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="you@company.com"
                    ref={emailInput}
                    type="email"
                    value={values.email}
                  />
                  {errors.email && <p className="text-xs text-terracotta" id="contact-email-error" role="alert">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-bold uppercase text-terracotta" htmlFor="contact-message">
                    Message
                  </label>
                  <textarea
                    aria-describedby={`contact-message-prompt${errors.message ? ' contact-message-error' : ''}`}
                    aria-invalid={Boolean(errors.message)}
                    className={`${fieldClass('message')} resize-y`}
                    id="contact-message"
                    name="message"
                    onChange={(event) => updateField('message', event.target.value)}
                    placeholder="Share a little context for the conversation."
                    ref={messageInput}
                    rows={4}
                    value={values.message}
                  />
                  <p className="text-xs leading-relaxed text-muted" id="contact-message-prompt">
                    {selectedIntent.prompt}
                  </p>
                  {errors.message && <p className="text-xs text-terracotta" id="contact-message-error" role="alert">{errors.message}</p>}
                </div>
              </div>

              {deliveryNotice && (
                <p className="rounded-lg border border-hairline bg-sand p-3 text-sm leading-relaxed text-ink" role="status">
                  Your message hasn’t been sent because email delivery isn’t configured yet. You can send it using your email app instead{' '}
                  <a className="font-semibold text-terracotta underline" href={createMailto(selectedIntent.label, values)}>
                    email Paula
                  </a>
                  .
                </p>
              )}

              <button
                className="w-full rounded-lg bg-terracotta px-4 py-3 font-mono text-xs font-bold text-white transition-colors hover:bg-[#B24D28]"
                type="submit"
              >
                Review message
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import { addCodeCopyButtons, type ClipboardWriter } from '../../../src/lib/codeBlockCopy';

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function createArticleWithCode(source: string): HTMLElement {
  const article = document.createElement('div');
  const pre = document.createElement('pre');
  const code = document.createElement('code');

  pre.className = 'astro-code';
  Object.defineProperty(code, 'innerText', { configurable: true, value: source });
  pre.append(code);
  article.append(pre);
  document.body.append(article);

  return article;
}

describe('code block copy controls', () => {
  it('copies the highlighted snippet and briefly confirms success', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn<ClipboardWriter>().mockResolvedValue();
    const article = createArticleWithCode('const answer = 42;\n');

    addCodeCopyButtons(article, writeText);
    const button = article.querySelector<HTMLButtonElement>('.code-copy-button');
    expect(button).not.toBeNull();

    button?.click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith('const answer = 42;');
    expect(button?.textContent).toBe('Copied!');
    expect(button).toHaveAttribute('aria-live', 'polite');

    vi.advanceTimersByTime(1800);
    expect(button?.textContent).toBe('Copy');
  });

  it('shows a failure state and logs clipboard errors', async () => {
    vi.useFakeTimers();
    const error = new Error('Clipboard unavailable');
    const writeText = vi.fn<ClipboardWriter>().mockRejectedValue(error);
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const article = createArticleWithCode('const answer = 42;');

    addCodeCopyButtons(article, writeText);
    const button = article.querySelector<HTMLButtonElement>('.code-copy-button');
    button?.click();
    await Promise.resolve();

    expect(button?.textContent).toBe('Copy failed');
    expect(errorLog).toHaveBeenCalledWith('Unable to copy code block to clipboard.', error);
  });
});

export type ClipboardWriter = (text: string) => Promise<void>;

export function addCodeCopyButtons(
  root: ParentNode,
  writeText: ClipboardWriter = (text) => navigator.clipboard.writeText(text),
): void {
  const codeBlocks = root.querySelectorAll<HTMLPreElement>('pre.astro-code');

  for (const pre of codeBlocks) {
    if (pre.dataset.copyButtonAdded === 'true') continue;

    const code = pre.querySelector('code');
    if (!code) throw new Error('Highlighted code block is missing its code element.');

    const parent = pre.parentNode;
    if (!parent) throw new Error('Highlighted code block must be attached to a parent element.');

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    parent.insertBefore(wrapper, pre);
    wrapper.append(pre);
    pre.dataset.copyButtonAdded = 'true';

    const button = document.createElement('button');
    button.className = 'code-copy-button';
    button.type = 'button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code');
    button.setAttribute('aria-live', 'polite');
    wrapper.append(button);

    let resetTimer: number | undefined;

    button.addEventListener('click', async () => {
      button.disabled = true;

      try {
        const codeText = code.innerText.replace(/\r?\n$/, '');
        await writeText(codeText);
        button.textContent = 'Copied!';
        button.setAttribute('aria-label', 'Code copied to clipboard');
      } catch (error) {
        console.error('Unable to copy code block to clipboard.', error);
        button.textContent = 'Copy failed';
        button.setAttribute('aria-label', 'Code copy failed');
      } finally {
        button.disabled = false;
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          button.textContent = 'Copy';
          button.setAttribute('aria-label', 'Copy code');
        }, 1800);
      }
    });
  }
}

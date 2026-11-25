import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PromptDemo from '../../../src/components/PromptDemo';

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();

  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
  } else {
    Reflect.deleteProperty(navigator, 'clipboard');
  }
});

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
}

describe('PromptDemo', () => {
  it('switches among the specification, system prompt, and output/diff views', () => {
    render(<PromptDemo />);

    const specTab = screen.getByRole('tab', { name: 'Spec' });
    const panel = screen.getByRole('tabpanel');
    expect(specTab).toHaveAttribute('aria-selected', 'true');
    expect(specTab).toHaveAttribute('aria-controls', 'workflow-viewer-panel');
    expect(panel).toHaveAttribute('aria-labelledby', 'workflow-viewer-tab-spec');
    expect(panel).toHaveTextContent('Review pull request changes');

    fireEvent.click(screen.getByRole('tab', { name: 'System Prompt' }));
    expect(panel).toHaveTextContent('Automated Architectural Evaluation Agent');

    fireEvent.click(screen.getByRole('tab', { name: 'Output & Diff' }));
    expect(panel).toHaveTextContent('REMEDIATION DIFF');
    expect(panel).toHaveTextContent('import { userApi }');
  });

  it('supports wrapping arrow navigation and Home/End keys', () => {
    render(<PromptDemo />);

    const specTab = screen.getByRole('tab', { name: 'Spec' });
    const systemPromptTab = screen.getByRole('tab', { name: 'System Prompt' });
    const outputDiffTab = screen.getByRole('tab', { name: 'Output & Diff' });

    fireEvent.keyDown(specTab, { key: 'ArrowLeft' });
    expect(outputDiffTab).toHaveFocus();
    expect(outputDiffTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(outputDiffTab, { key: 'ArrowRight' });
    expect(specTab).toHaveFocus();

    fireEvent.keyDown(specTab, { key: 'End' });
    expect(outputDiffTab).toHaveFocus();

    fireEvent.keyDown(outputDiffTab, { key: 'Home' });
    expect(specTab).toHaveFocus();
    expect(systemPromptTab).toHaveAttribute('tabindex', '-1');
  });

  it('copies the active view and confirms success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    render(<PromptDemo />);

    fireEvent.click(screen.getByRole('tab', { name: 'Output & Diff' }));
    const content = screen.getByRole('tabpanel').querySelector('pre')?.textContent;
    expect(content).toContain('REMEDIATION DIFF');
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByText('Copied!')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(content);
  });

  it('reports clipboard failures', async () => {
    const error = new Error('Clipboard unavailable');
    const writeText = vi.fn().mockRejectedValue(error);
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockClipboard(writeText);
    render(<PromptDemo />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByText('Copy failed.')).toBeInTheDocument();
    expect(errorLog).toHaveBeenCalledWith('Unable to copy the active workflow view.', error);
  });
});

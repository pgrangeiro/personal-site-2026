import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ContactExperience from './ContactExperience';

afterEach(cleanup);

describe('ContactExperience', () => {
  it('explains that contact delivery is unavailable instead of reporting a false success', () => {
    render(<ContactExperience />);

    fireEvent.click(screen.getByRole('button', { name: /coffee chat/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/will not send or store your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact form not configured' })).toBeDisabled();
    expect(screen.queryByText(/message sent/i)).not.toBeInTheDocument();
  });

  it('opens the shared dialog from a footer-style contact trigger', () => {
    render(
      <>
        <ContactExperience />
        <button data-contact-intent="hello" data-open-contact type="button">
          Footer Coffee Chat
        </button>
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Footer Coffee Chat' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Say Hello / General Networking' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

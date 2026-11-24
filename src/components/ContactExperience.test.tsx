import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ContactExperience from './ContactExperience';

afterEach(cleanup);

describe('ContactExperience', () => {
  it('opens the header dialog with the leadership intent selected', () => {
    render(<ContactExperience />);

    fireEvent.click(screen.getByRole('button', { name: /coffee chat/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask a leadership question' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('updates the example prompt for each conversation intent', () => {
    render(<ContactExperience />);

    fireEvent.click(screen.getByRole('button', { name: /coffee chat/i }));
    expect(screen.getByText(/preparing for my first engineering leadership role/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Compare AI dev workflows' }));
    expect(screen.getByText(/exploring AI coding workflows/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Say hello' }));
    expect(screen.getByText(/found your site through/i)).toBeInTheDocument();
  });

  it('opens the shared dialog from page contact triggers', () => {
    render(
      <>
        <ContactExperience />
        <button data-contact-intent="leadership" data-open-contact type="button">
          Article Coffee Chat
        </button>
        <button data-contact-intent="hello" data-open-contact type="button">
          About Coffee Chat
        </button>
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Article Coffee Chat' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask a leadership question' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'About Coffee Chat' }));
    expect(screen.getByRole('button', { name: 'Say hello' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows inline errors for missing fields and retains entered values', () => {
    render(<ContactExperience />);
    fireEvent.click(screen.getByRole('button', { name: /coffee chat/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Review message' }));

    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Please add a message so Paula knows what is on your mind.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'I would like to compare notes.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Review message' }));

    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText('Email')).toHaveValue('not-an-email');
    expect(screen.getByLabelText('Message')).toHaveValue('I would like to compare notes.');
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Please enter your name.')).not.toBeInTheDocument();
    expect(screen.queryByText(/Please add a message/)).not.toBeInTheDocument();
  });

  it('states that a valid message was not sent and offers a prefilled email-app link', () => {
    render(<ContactExperience />);
    fireEvent.click(screen.getByRole('button', { name: /coffee chat/i }));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'I would like leadership advice.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Review message' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Your message hasn’t been sent because email delivery isn’t configured yet.',
    );
    expect(screen.getByRole('link', { name: 'email Paula' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:contato@paulagrangeiro.com.br'),
    );
    expect(screen.getByRole('link', { name: 'email Paula' }).getAttribute('href')).toContain(
      'Ada+Lovelace',
    );
    expect(screen.queryByText(/message sent/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
    expect(screen.getByLabelText('Message')).toHaveValue('I would like leadership advice.');
  });
});

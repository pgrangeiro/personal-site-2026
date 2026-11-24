import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ContactExperience from './ContactExperience';

describe('ContactExperience', () => {
  it('explains that contact delivery is unavailable instead of reporting a false success', () => {
    render(<ContactExperience />);

    fireEvent.click(screen.getByRole('button', { name: /coffee chat/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/will not send or store your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact form not configured' })).toBeDisabled();
    expect(screen.queryByText(/message sent/i)).not.toBeInTheDocument();
  });
});

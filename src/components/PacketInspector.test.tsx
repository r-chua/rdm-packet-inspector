import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PacketInspector } from './PacketInspector';

describe('PacketInspector', () => {
  it('renders the initial state correctly', () => {
    render(<PacketInspector />);

    // Check for the title
    expect(
      screen.getByRole('heading', { name: /rdm packet inspector/i, level: 1 })
    ).toBeInTheDocument();

    // Empty textarea should be present
    const inputElement = screen.getByRole('textbox', { name: /packet data/i });
    expect(inputElement).toHaveValue('');

    // No error message should be displayed
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();

    // No hex view or field view should be displayed initially
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
    expect(screen.queryAllByRole('term')).toHaveLength(0);
  });

  it('parses valid input', () => {});

  it('displays error on invalid input', () => {});

  it('populates and parses from the example dropdown', () => {});
});

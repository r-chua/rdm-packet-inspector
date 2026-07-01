import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { PacketInspector } from './PacketInspector';
import * as examplePackets from '../parser/examples.ts';

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

  it('parses valid input', async () => {
    render(<PacketInspector />);

    const inputElement = screen.getByRole('textbox', { name: /packet data/i });
    const user = userEvent.setup();

    await user.click(inputElement);
    await user.paste(examplePackets.GET_DEVICE_INFO);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // No error message should be displayed
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();

    // Hex view and field view should be populated
    expect(screen.getByText('DEVICE_INFO')).toBeInTheDocument();
    expect(screen.getByText('GET_COMMAND')).toBeInTheDocument();
  });

  it('displays error on invalid input', () => {});

  it('populates and parses from the example dropdown', () => {});
});

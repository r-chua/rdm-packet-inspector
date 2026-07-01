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

  it('displays error on invalid input', async () => {
    render(<PacketInspector />);

    const inputElement = screen.getByRole('textbox', { name: /packet data/i });
    const user = userEvent.setup();

    await user.click(inputElement);
    await user.paste('o1 at gg qu');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Error message should be displayed
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText(/invalid hex/i)).toBeInTheDocument();

    // No hex view or field view should be displayed
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
    expect(screen.queryAllByRole('term')).toHaveLength(0);
  });

  it('clears error on valid input after an error', async () => {
    render(<PacketInspector />);

    const inputElement = screen.getByRole('textbox', { name: /packet data/i });
    const user = userEvent.setup();

    await user.click(inputElement);
    await user.paste('o1 at gg qu');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Error message should be displayed
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText(/invalid hex/i)).toBeInTheDocument();

    // Now enter valid input
    await user.clear(inputElement);
    await user.paste(examplePackets.GET_DEVICE_INFO);
    await user.click(submitButton);

    // Error message should be cleared
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();
    expect(screen.queryByText(/invalid hex/i)).not.toBeInTheDocument();
  });

  it('populates and parses from the example dropdown', async () => {
    render(<PacketInspector />);

    const exampleDropdown = screen.getByRole('combobox', {
      name: /example packets/i,
    });
    const user = userEvent.setup();

    await user.selectOptions(
      exampleDropdown,
      examplePackets.DISCOVERY_UNIQUE_REQUEST
    );

    // Input is populated with the selected example
    expect(screen.getByRole('textbox', { name: /packet data/i })).toHaveValue(
      examplePackets.DISCOVERY_UNIQUE_REQUEST
    );

    // No error message should be displayed
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();

    expect(screen.getByText('DISC_UNIQUE_BRANCH')).toBeInTheDocument();
    expect(screen.getByText('DISCOVERY_COMMAND')).toBeInTheDocument();
  });

  it('clears parse on reset button press', async () => {
    render(<PacketInspector />);

    const inputElement = screen.getByRole('textbox', { name: /packet data/i });
    const user = userEvent.setup();

    await user.click(inputElement);
    await user.paste(examplePackets.GET_DEVICE_INFO);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Hex view and field view should be populated
    expect(screen.getByText('DEVICE_INFO')).toBeInTheDocument();
    expect(screen.getByText('GET_COMMAND')).toBeInTheDocument();

    // Now click the reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Input should be cleared
    expect(inputElement).toHaveValue('');

    // Hex view and field view should be cleared
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
    expect(screen.queryAllByRole('term')).toHaveLength(0);
  });

  it('clears error on reset button press', async () => {
    render(<PacketInspector />);

    const inputElement = screen.getByRole('textbox', { name: /packet data/i });
    const user = userEvent.setup();

    await user.click(inputElement);
    await user.paste('o1 at gg qu');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Error message should be displayed
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText(/invalid hex/i)).toBeInTheDocument();

    // Now click the reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Input should be cleared
    expect(inputElement).toHaveValue('');

    // Error message should be cleared
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();
    expect(screen.queryByText(/invalid hex/i)).not.toBeInTheDocument();
  });

  it('empty input clears without error', async () => {
    render(<PacketInspector />);

    const inputElement = screen.getByRole('textbox', { name: /packet data/i });
    const user = userEvent.setup();

    await user.click(inputElement);
    await user.paste(examplePackets.GET_DEVICE_INFO);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Hex view and field view should be populated
    expect(screen.getByText('DEVICE_INFO')).toBeInTheDocument();
    expect(screen.getByText('GET_COMMAND')).toBeInTheDocument();

    // Now clear the input
    await user.clear(inputElement);
    await user.type(inputElement, '   '); // Enter whitespace
    await user.click(submitButton);

    // No error message should be displayed
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();

    // Hex view and field view should be cleared
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
    expect(screen.queryAllByRole('term')).toHaveLength(0);
  });

  describe('interaction', () => {
    it.todo('highlights field when hovering a byte');
    it.todo('highlights bytes when hovering a field');
    it.todo('selects field when clicking a byte');
    it.todo('selects bytes when clicking a field');
    it.todo('navigate byte table with keyboard');
    it.todo('navigate field list with keyboard');
    it.todo('selects field with keyboard');
    it.todo('syncs keyboard cursor to clicked cell');
    it.todo('clears selection on reset');
    it.todo('clears selection on new parse');
  });
});

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
    it('highlights field when hovering a byte', async () => {
      render(<PacketInspector />);

      const inputElement = screen.getByRole('textbox', {
        name: /packet data/i,
      });
      const user = userEvent.setup();

      await user.click(inputElement);
      await user.paste(examplePackets.GET_DEVICE_INFO);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Hover over the first byte cell
      const targetCell = screen.getAllByRole('cell')[4];
      await user.hover(targetCell);
      expect(targetCell).toHaveAttribute('data-highlighted', 'true');

      // Other cells in the same field should also be highlighted
      const neighboringCell = screen.getAllByRole('cell')[5];
      expect(neighboringCell).toHaveAttribute('data-highlighted', 'true');

      // The corresponding field should be highlighted
      const highlightedField = screen
        .getByText('Destination UID')
        .closest('[data-highlighted]');
      expect(highlightedField).toHaveAttribute('data-highlighted', 'true');

      // Only one field should be highlighted
      expect(
        screen
          .queryAllByRole('term')
          .filter(
            (term) =>
              term
                .closest('[data-highlighted]')
                ?.getAttribute('data-highlighted') === 'true'
          )
      ).toHaveLength(1);

      // Unhover the first byte cell
      await user.unhover(targetCell);
      expect(targetCell).toHaveAttribute('data-highlighted', 'false');
      expect(highlightedField).toHaveAttribute('data-highlighted', 'false');
    });

    it('highlights bytes when hovering a field', async () => {
      render(<PacketInspector />);

      const inputElement = screen.getByRole('textbox', {
        name: /packet data/i,
      });
      const user = userEvent.setup();

      await user.click(inputElement);
      await user.paste(examplePackets.GET_DEVICE_INFO);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Hover over the first field
      const targetField = screen.getByText('Destination UID');
      await user.hover(targetField);
      expect(targetField.closest('[data-highlighted]')).toHaveAttribute(
        'data-highlighted',
        'true'
      );

      // Other bytes in the same field should be highlighted
      // Destination UID field corresponds to bytes 3-8 (0-indexed)
      for (let i = 3; i < 9; i++) {
        const cell = screen.getAllByRole('cell')[i];
        expect(cell).toHaveAttribute('data-highlighted', 'true');
      }

      // Other bytes should not be highlighted
      const priorCell = screen.getAllByRole('cell')[2];
      const followingCell = screen.getAllByRole('cell')[9];
      expect(priorCell).toHaveAttribute('data-highlighted', 'false');
      expect(followingCell).toHaveAttribute('data-highlighted', 'false');

      // Unhover the first field
      await user.unhover(targetField);
      expect(targetField.closest('[data-highlighted]')).toHaveAttribute(
        'data-highlighted',
        'false'
      );
      // Other bytes in the same field should not be highlighted
      for (let i = 3; i < 9; i++) {
        const cell = screen.getAllByRole('cell')[i];
        expect(cell).toHaveAttribute('data-highlighted', 'false');
      }
    });

    it('selects field when clicking a byte', async () => {
      render(<PacketInspector />);

      const inputElement = screen.getByRole('textbox', {
        name: /packet data/i,
      });
      const user = userEvent.setup();

      await user.click(inputElement);
      await user.paste(examplePackets.GET_DEVICE_INFO);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Click on cell 4
      const targetCell = screen.getAllByRole('cell')[4];
      await user.click(targetCell);

      // This field's cells should be selected
      // Destination UID field corresponds to bytes 3-8 (0-indexed)
      for (let i = 3; i < 9; i++) {
        const cell = screen.getAllByRole('cell')[i];
        expect(cell).toHaveAttribute('data-selected', 'true');
      }
      const previousCell = screen.getAllByRole('cell')[2];
      const nextCell = screen.getAllByRole('cell')[9];
      expect(previousCell).toHaveAttribute('data-selected', 'false');
      expect(nextCell).toHaveAttribute('data-selected', 'false');

      // The corresponding field should be selected
      const selectedField = screen
        .getByText('Destination UID')
        .closest('[data-selected]');
      expect(selectedField).toHaveAttribute('data-selected', 'true');

      // Other fields should not be selected
      const otherField = screen.getByText('Source UID');
      expect(otherField.closest('[data-selected]')).toHaveAttribute(
        'data-selected',
        'false'
      );

      // Click on cell 1 to change the selected field
      const subStartCodeCell = screen.getAllByRole('cell')[1];
      await user.click(subStartCodeCell);

      // The new cell should be selected
      expect(subStartCodeCell).toHaveAttribute('data-selected', 'true');
      // The new field should be selected
      const newSelectedField = screen
        .getByText('Sub Start Code')
        .closest('[data-selected]');
      expect(newSelectedField).toHaveAttribute('data-selected', 'true');

      // The previous field should be deselected
      expect(selectedField).toHaveAttribute('data-selected', 'false');
      // The previous field's cells should be deselected
      for (let i = 3; i < 9; i++) {
        const cell = screen.getAllByRole('cell')[i];
        expect(cell).toHaveAttribute('data-selected', 'false');
      }
    });

    it('selects bytes when clicking a field', async () => {
      render(<PacketInspector />);

      const inputElement = screen.getByRole('textbox', {
        name: /packet data/i,
      });
      const user = userEvent.setup();

      await user.click(inputElement);
      await user.paste(examplePackets.GET_DEVICE_INFO);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Click on the Destination UID field
      const targetField = screen.getByText('Destination UID');
      await user.click(targetField);

      // The corresponding field should be selected
      const selectedField = screen
        .getByText('Destination UID')
        .closest('[data-selected]');
      expect(selectedField).toHaveAttribute('data-selected', 'true');

      // Other fields should not be selected
      const otherField = screen.getByText('Source UID');
      expect(otherField.closest('[data-selected]')).toHaveAttribute(
        'data-selected',
        'false'
      );

      // This field's cells should be selected
      // Destination UID field corresponds to bytes 3-8 (0-indexed)
      for (let i = 3; i < 9; i++) {
        const cell = screen.getAllByRole('cell')[i];
        expect(cell).toHaveAttribute('data-selected', 'true');
      }

      // Neighboring cells should not be selected
      const previousCell = screen.getAllByRole('cell')[2];
      const nextCell = screen.getAllByRole('cell')[9];
      expect(previousCell).toHaveAttribute('data-selected', 'false');
      expect(nextCell).toHaveAttribute('data-selected', 'false');

      // Click on the Sub Start Code field to change the selected field
      const subStartCodeField = screen.getByText('Sub Start Code');
      await user.click(subStartCodeField);

      // The new field should be selected
      const newSelectedField = screen
        .getByText('Sub Start Code')
        .closest('[data-selected]');
      expect(newSelectedField).toHaveAttribute('data-selected', 'true');
      expect(screen.getAllByRole('cell')[1]).toHaveAttribute(
        'data-selected',
        'true'
      );

      // The previous field should be deselected
      expect(selectedField).toHaveAttribute('data-selected', 'false');

      // The previous field's cells should be deselected
      for (let i = 3; i < 9; i++) {
        const cell = screen.getAllByRole('cell')[i];
        expect(cell).toHaveAttribute('data-selected', 'false');
      }
    });

    it.todo('navigate byte table with keyboard');
    it.todo('navigate field list with keyboard');
    it.todo('selects field with keyboard');
    it.todo('syncs keyboard cursor to clicked cell');
    it.todo('clears selection on reset');
    it.todo('clears selection on new parse');
  });
});

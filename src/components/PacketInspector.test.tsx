import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { PacketInspector } from './PacketInspector';
import * as examplePackets from '../parser/examples.ts';

function getInputElement() {
  return screen.getByRole('textbox', { name: /packet data/i });
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /submit/i });
}

async function renderAndParsePacket(
  hexString: string = examplePackets.GET_DEVICE_INFO
) {
  render(<PacketInspector />);

  const inputElement = getInputElement();
  const user = userEvent.setup();

  await user.click(inputElement);
  await user.paste(hexString);

  const submitButton = getSubmitButton();
  await user.click(submitButton);

  return { user };
}

function getByteCell(n: number) {
  return screen.getAllByRole('cell')[n];
}

function getFieldEntry(fieldName: string) {
  const fieldRow = screen
    .getByText(fieldName)
    .closest(`[${HIGHLIGHTED_ATTRIBUTE}]`);
  if (!fieldRow) {
    throw new Error(`Field row for "${fieldName}" not found`);
  }
  return fieldRow;
}

const HIGHLIGHTED_ATTRIBUTE = 'data-highlighted';
const SELECTED_ATTRIBUTE = 'data-selected';

describe('PacketInspector', () => {
  it('renders the initial state correctly', () => {
    render(<PacketInspector />);

    // Check for the title
    expect(
      screen.getByRole('heading', { name: /rdm packet inspector/i, level: 1 })
    ).toBeInTheDocument();

    // Empty textarea should be present
    const inputElement = getInputElement();
    expect(inputElement).toHaveValue('');

    // No error message should be displayed
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();

    // No hex view or field view should be displayed initially
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
    expect(screen.queryAllByRole('term')).toHaveLength(0);
  });

  it('parses valid input', async () => {
    await renderAndParsePacket();

    // No error message should be displayed
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();

    // Hex view and field view should be populated
    expect(screen.getByText('DEVICE_INFO')).toBeInTheDocument();
    expect(screen.getByText('GET_COMMAND')).toBeInTheDocument();
  });

  it('displays error on invalid input', async () => {
    await renderAndParsePacket('o1 at gg qu');

    // Error message should be displayed
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText(/invalid hex/i)).toBeInTheDocument();

    // No hex view or field view should be displayed
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
    expect(screen.queryAllByRole('term')).toHaveLength(0);
  });

  it('clears error on valid input after an error', async () => {
    const { user } = await renderAndParsePacket('o1 at gg qu');

    // Error message should be displayed
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText(/invalid hex/i)).toBeInTheDocument();

    // Now enter valid input
    const inputElement = getInputElement();
    const submitButton = getSubmitButton();
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
    expect(getInputElement()).toHaveValue(
      examplePackets.DISCOVERY_UNIQUE_REQUEST
    );

    // No error message should be displayed
    expect(screen.queryByText('Error:')).not.toBeInTheDocument();

    expect(screen.getByText('DISC_UNIQUE_BRANCH')).toBeInTheDocument();
    expect(screen.getByText('DISCOVERY_COMMAND')).toBeInTheDocument();
  });

  it('clears parse on reset button press', async () => {
    const { user } = await renderAndParsePacket();

    const inputElement = getInputElement();

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
    const { user } = await renderAndParsePacket('o1 at gg qu');

    const inputElement = getInputElement();

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
    const { user } = await renderAndParsePacket();

    const inputElement = getInputElement();
    const submitButton = getSubmitButton();

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
      const { user } = await renderAndParsePacket();

      // Hover over the first byte cell
      const targetCell = getByteCell(4);
      await user.hover(targetCell);
      expect(targetCell).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'true');

      // Other cells in the same field should also be highlighted
      const neighboringCell = getByteCell(5);
      expect(neighboringCell).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'true');

      // The corresponding field should be highlighted
      const highlightedField = getFieldEntry('Destination UID');
      expect(highlightedField).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'true');

      // Only one field should be highlighted
      expect(
        screen
          .queryAllByRole('term')
          .filter(
            (term) =>
              term
                .closest(`[${HIGHLIGHTED_ATTRIBUTE}]`)
                ?.getAttribute(HIGHLIGHTED_ATTRIBUTE) === 'true'
          )
      ).toHaveLength(1);

      // Unhover the first byte cell
      await user.unhover(targetCell);
      expect(targetCell).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'false');
      expect(highlightedField).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'false');
    });

    it('highlights bytes when hovering a field', async () => {
      const { user } = await renderAndParsePacket();

      // Hover over the first field
      const targetField = getFieldEntry('Destination UID');
      await user.hover(targetField);
      expect(targetField).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'true');

      // Other bytes in the same field should be highlighted
      // Destination UID field corresponds to bytes 3-8 (0-indexed)
      for (let i = 3; i < 9; i++) {
        const cell = getByteCell(i);
        expect(cell).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'true');
      }

      // Other bytes should not be highlighted
      const priorCell = getByteCell(2);
      const followingCell = getByteCell(9);
      expect(priorCell).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'false');
      expect(followingCell).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'false');

      // Unhover the first field
      await user.unhover(targetField);
      expect(targetField).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'false');
      // Other bytes in the same field should not be highlighted
      for (let i = 3; i < 9; i++) {
        const cell = getByteCell(i);
        expect(cell).toHaveAttribute(HIGHLIGHTED_ATTRIBUTE, 'false');
      }
    });

    it('selects field when clicking a byte', async () => {
      const { user } = await renderAndParsePacket();

      // Click on cell 4
      const targetCell = getByteCell(4);
      await user.click(targetCell);

      // This field's cells should be selected
      // Destination UID field corresponds to bytes 3-8 (0-indexed)
      for (let i = 3; i < 9; i++) {
        const cell = getByteCell(i);
        expect(cell).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');
      }
      const previousCell = getByteCell(2);
      const nextCell = getByteCell(9);
      expect(previousCell).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');
      expect(nextCell).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');

      // The corresponding field should be selected
      const selectedField = getFieldEntry('Destination UID');
      expect(selectedField).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');

      // Other fields should not be selected
      const otherField = getFieldEntry('Source UID');
      expect(otherField).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');

      // Click on cell 1 to change the selected field
      const subStartCodeCell = getByteCell(1);
      await user.click(subStartCodeCell);

      // The new cell should be selected
      expect(subStartCodeCell).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');
      // The new field should be selected
      const newSelectedField = getFieldEntry('Sub Start Code');
      expect(newSelectedField).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');

      // The previous field should be deselected
      expect(selectedField).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');
      // The previous field's cells should be deselected
      for (let i = 3; i < 9; i++) {
        const cell = getByteCell(i);
        expect(cell).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');
      }
    });

    it('selects bytes when clicking a field', async () => {
      const { user } = await renderAndParsePacket();

      // Click on the Destination UID field
      const targetField = getFieldEntry('Destination UID');
      await user.click(targetField);

      // The corresponding field should be selected
      const selectedField = getFieldEntry('Destination UID');
      expect(selectedField).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');

      // Other fields should not be selected
      const otherField = getFieldEntry('Source UID');
      expect(otherField).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');

      // This field's cells should be selected
      // Destination UID field corresponds to bytes 3-8 (0-indexed)
      for (let i = 3; i < 9; i++) {
        const cell = getByteCell(i);
        expect(cell).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');
      }

      // Neighboring cells should not be selected
      const previousCell = getByteCell(2);
      const nextCell = getByteCell(9);
      expect(previousCell).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');
      expect(nextCell).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');

      // Click on the Sub Start Code field to change the selected field
      const subStartCodeField = getFieldEntry('Sub Start Code');
      await user.click(subStartCodeField);

      // The new field should be selected
      const newSelectedField = getFieldEntry('Sub Start Code');
      expect(newSelectedField).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');
      expect(getByteCell(1)).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');

      // The previous field should be deselected
      expect(selectedField).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');

      // The previous field's cells should be deselected
      for (let i = 3; i < 9; i++) {
        const cell = getByteCell(i);
        expect(cell).toHaveAttribute(SELECTED_ATTRIBUTE, 'false');
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

import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
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

/**
 * Tabs through the document until the specified element is focused.
 *
 * @param user The userEvent instance to use for simulating user interactions.
 * @param element The target element to focus by tabbing.
 * @param maxAttempts The maximum number of tab attempts before throwing an
 *    error.
 * @throws Will throw an error if the element is not focused after the maximum
 *    attempts.
 */
async function tabToElement(
  user: UserEvent,
  element: HTMLElement,
  maxAttempts: number = 10
) {
  // Keep tabbing until the element is focused or maxAttempts is reached
  for (let i = 0; i < maxAttempts; i++) {
    if (document.activeElement === element) {
      return;
    }
    await user.tab();
  }
  throw new Error('Failed to focus the element after maximum attempts');
}

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

    it('navigate byte table with keyboard', async () => {
      const { user } = await renderAndParsePacket();

      // Tab through the interactive elements to reach the hex view table.
      const table = screen.getByRole('table', { name: /hex view/i });
      await tabToElement(user, table);
      expect(table).toHaveFocus();

      // Press ArrowRight to move focus to the first cell
      await user.keyboard('{ArrowRight}'); // Move to the first cell
      const firstCell = getByteCell(0);
      expect(firstCell).toHaveFocus();

      // Press ArrowRight to move focus to the Destination UID (cell 4)
      for (let i = 0; i < 4; i++) {
        await user.keyboard('{ArrowRight}');
      }
      const destinationUidCell = getByteCell(4);
      expect(destinationUidCell).toHaveFocus();
      expect(firstCell).not.toHaveFocus(); // First cell no longer has focus

      // Press enter to select the Destination UID bytes
      await user.keyboard('{Enter}');

      // Destination UID cells are selected
      for (let i = 3; i < 9; i++) {
        const cell = getByteCell(i);
        expect(cell).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');
      }

      // Press ArrowLeft to move focus back to the first cell
      for (let i = 0; i < 4; i++) {
        await user.keyboard('{ArrowLeft}');
      }
      expect(firstCell).toHaveFocus();
      // Destination UID cell no longer has focus
      expect(destinationUidCell).not.toHaveFocus();

      // Press ArrowDown to move focus to the first cell of the next row
      await user.keyboard('{ArrowDown}');
      const nextRowFirstCell = getByteCell(16);
      expect(nextRowFirstCell).toHaveFocus();
      expect(firstCell).not.toHaveFocus(); // First cell no longer has focus
    });

    it('navigate field list with keyboard', async () => {
      const { user } = await renderAndParsePacket();

      // Tab through the interactive elements to reach the field view table.
      const fieldTable = document.getElementById('field-view-list');
      if (!fieldTable) {
        throw new Error('Field view table not found');
      }
      await tabToElement(user, fieldTable); // Focus on the field view table
      expect(fieldTable).toHaveFocus();

      // Press ArrowDown to move focus to the first field
      await user.keyboard('{ArrowDown}');
      const firstField = getFieldEntry('Start Code');
      expect(firstField).toHaveFocus();

      // Press ArrowDown to move focus to the Destination UID field
      for (let i = 0; i < 3; i++) {
        await user.keyboard('{ArrowDown}');
      }
      const destinationUidField = getFieldEntry('Destination UID');
      expect(destinationUidField).toHaveFocus();
      expect(firstField).not.toHaveFocus(); // First field no longer has focus

      // Press enter to select the Destination UID field
      await user.keyboard('{Enter}');
      const selectedField = getFieldEntry('Destination UID');
      expect(selectedField).toHaveAttribute(SELECTED_ATTRIBUTE, 'true');

      // Press ArrowUp to move focus back to the first field
      for (let i = 0; i < 3; i++) {
        await user.keyboard('{ArrowUp}');
      }
      expect(firstField).toHaveFocus();
      // Destination UID field no longer has focus
      expect(destinationUidField).not.toHaveFocus();
    });

    it('syncs keyboard cursor to clicked cell', async () => {
      const { user } = await renderAndParsePacket();

      // Tab to the hex view table
      const table = screen.getByRole('table', { name: /hex view/i });
      await tabToElement(user, table);
      expect(table).toHaveFocus();

      // ArrowRight to move focus to the first cell
      await user.keyboard('{ArrowRight}');
      const firstCell = getByteCell(0);
      expect(firstCell).toHaveFocus();

      // Click on cell 4 (Destination UID)
      const targetCell = getByteCell(4);
      await user.click(targetCell);

      // The clicked cell should have focus
      expect(targetCell).toHaveFocus();
      expect(firstCell).not.toHaveFocus(); // First cell no longer has focus

      // ArrowLeft should move focus to cell 3
      await user.keyboard('{ArrowLeft}');
      const previousCell = getByteCell(3);
      expect(previousCell).toHaveFocus();
      expect(targetCell).not.toHaveFocus(); // Clicked cell no longer has focus
    });

    it('syncs keyboard cursor to clicked field', async () => {
      const { user } = await renderAndParsePacket();

      // Tab to the field view table
      const fieldTable = document.getElementById('field-view-list');
      if (!fieldTable) {
        throw new Error('Field view table not found');
      }
      await tabToElement(user, fieldTable);
      expect(fieldTable).toHaveFocus();

      // ArrowDown to move focus to the first field
      await user.keyboard('{ArrowDown}');
      const firstField = getFieldEntry('Start Code');
      expect(firstField).toHaveFocus();

      // Click on the Destination UID field
      const targetField = getFieldEntry('Destination UID');
      await user.click(targetField);

      // The clicked field should have focus
      expect(targetField).toHaveFocus();
      expect(firstField).not.toHaveFocus(); // First field no longer has focus

      // ArrowUp should move focus to the previous field
      await user.keyboard('{ArrowUp}');
      const previousField = getFieldEntry('Message Length');
      expect(previousField).toHaveFocus();
      expect(targetField).not.toHaveFocus(); // Clicked field no longer has focus
    });

    it.todo('clears selection on reset');
    it.todo('clears selection on new parse');
  });
});

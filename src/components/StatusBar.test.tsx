import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBar } from './StatusBar';
import { getFieldEntries } from '../parser/fields';
import { parseRdmPacket } from '../parser/parse';
import * as examplePackets from '../parser/examples';

function getParsedFieldEntries(
  hexString: string = examplePackets.GET_DEVICE_INFO
) {
  const result = parseRdmPacket(hexString);
  if (!result.success || !result.packet) {
    throw new Error('Example packet failed to parse');
  }
  return {
    byteCount: result.rawBytes.length,
    fields: getFieldEntries(result.packet),
  };
}

describe('StatusBar', () => {
  it('should render as a footer landmark', () => {
    render(<StatusBar byteCount={null} selectedField={null} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should list the keyboard shortcuts', () => {
    render(<StatusBar byteCount={null} selectedField={null} />);
    const footer = screen.getByRole('contentinfo');

    expect(within(footer).getByText(/move byte/i)).toBeInTheDocument();
    expect(within(footer).getByText(/select field/i)).toBeInTheDocument();
    expect(within(footer).getByText(/clear/i)).toBeInTheDocument();
  });

  it('should show idle with no byte count when nothing is loaded', () => {
    render(<StatusBar byteCount={null} selectedField={null} />);
    const footer = screen.getByRole('contentinfo');

    expect(within(footer).getByText('idle')).toBeInTheDocument();
    expect(within(footer).queryByText(/bytes$/)).not.toBeInTheDocument();
  });

  it('should show the byte count and no selection when a packet is loaded', () => {
    const { byteCount } = getParsedFieldEntries();
    render(<StatusBar byteCount={byteCount} selectedField={null} />);
    const footer = screen.getByRole('contentinfo');

    expect(within(footer).getByText(`${byteCount} bytes`)).toBeInTheDocument();
    expect(within(footer).getByText('no selection')).toBeInTheDocument();
    expect(within(footer).queryByText('idle')).not.toBeInTheDocument();
  });

  it('should show the selected field name and byte range', () => {
    const { byteCount, fields } = getParsedFieldEntries();
    const destinationUid = fields.find((f) => f.name === 'Destination UID');
    if (!destinationUid) throw new Error('Destination UID field not found');

    render(<StatusBar byteCount={byteCount} selectedField={destinationUid} />);
    const footer = screen.getByRole('contentinfo');

    expect(
      within(footer).getByText(
        `Destination UID · bytes ${destinationUid.startByte}-${destinationUid.endByte}`
      )
    ).toBeInTheDocument();
    expect(within(footer).queryByText('no selection')).not.toBeInTheDocument();
  });
});

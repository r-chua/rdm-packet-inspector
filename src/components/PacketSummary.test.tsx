import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PacketSummary } from './PacketSummary';
import { parseRdmPacket } from '../parser/parse';
import * as examplePackets from '../parser/examples';

function getParsedPacket(hexString: string = examplePackets.GET_DEVICE_INFO) {
  const result = parseRdmPacket(hexString);
  if (!result.success || !result.packet) {
    throw new Error('Example packet failed to parse');
  }
  return result.packet;
}

describe('PacketSummary', () => {
  it('should render nothing when no packet is loaded', () => {
    render(<PacketSummary packet={null} />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('should render as a labelled region when a packet is loaded', () => {
    render(<PacketSummary packet={getParsedPacket()} />);
    expect(
      screen.getByRole('region', { name: /packet summary/i })
    ).toBeInTheDocument();
  });

  it.todo('should show a COMMAND chip for command packets');
  it.todo('should show a RESPONSE chip for response packets');
  it.todo('should show the decoded PID name');
  it.todo('should show the source and destination UIDs');
  it.todo('should show CHECKSUM OK when the checksum is valid');
  it.todo('should show CHECKSUM FAIL when the checksum is invalid');
});

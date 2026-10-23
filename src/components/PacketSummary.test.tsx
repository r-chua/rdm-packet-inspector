import { render, screen, within } from '@testing-library/react';
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

function renderSummary(hexString: string = examplePackets.GET_DEVICE_INFO) {
  const packet = getParsedPacket(hexString);
  render(<PacketSummary packet={packet} />);
  return {
    summary: screen.getByRole('region', { name: /packet summary/i }),
    packet,
  };
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

  it('should show a COMMAND chip for command packets', () => {
    const { summary } = renderSummary();
    expect(within(summary).getByText('COMMAND')).toBeInTheDocument();
  });

  it('should show a RESPONSE chip for response packets', () => {
    const { summary } = renderSummary(examplePackets.GET_DEVICE_INFO_RESPONSE);
    expect(within(summary).getByText('RESPONSE')).toBeInTheDocument();
  });

  it('should show an UNKNOWN chip for unknown packets', () => {
    const { summary } = renderSummary(examplePackets.UNKNOWN_DIRECTION_PACKET);
    expect(within(summary).getByText('UNKNOWN')).toBeInTheDocument();
  });

  it('should show the decoded PID name', () => {
    const { summary, packet } = renderSummary();
    expect(
      within(summary).getByText(packet.parameterId.value.name)
    ).toBeInTheDocument();
  });

  it('should show the source and destination UIDs', () => {
    const { summary, packet } = renderSummary();
    expect(
      within(summary).getByText(
        packet.sourceUid.value + ' → ' + packet.destinationUid.value
      )
    ).toBeInTheDocument();
  });

  it('should show CHECKSUM OK when the checksum is valid', () => {
    const { summary } = renderSummary();
    expect(within(summary).getByText('CHECKSUM OK')).toBeInTheDocument();
    expect(
      within(summary).queryByText('CHECKSUM FAIL')
    ).not.toBeInTheDocument();
  });

  it('should show CHECKSUM FAIL when the checksum is invalid', () => {
    const { summary } = renderSummary(
      examplePackets.INVALID_CHECKSUM_START_ADDRESS
    );
    expect(within(summary).getByText('CHECKSUM FAIL')).toBeInTheDocument();
    expect(within(summary).queryByText('CHECKSUM OK')).not.toBeInTheDocument();
  });
});

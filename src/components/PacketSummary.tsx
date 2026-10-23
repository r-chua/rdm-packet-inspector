import type { RdmPacket } from '../parser/types';

type PacketSummaryProps = {
  packet: RdmPacket | null;
};

export function PacketSummary({ packet }: PacketSummaryProps) {
  if (!packet) return null;

  return <section aria-label="Packet summary"></section>;
}

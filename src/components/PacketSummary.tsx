import { cn, toString16Bit } from '../lib/utils';
import type { RdmPacket } from '../parser/types';

type PacketSummaryProps = {
  packet: RdmPacket | null;
};

const PILL_STYLE = cn(
  'font-mono text-[10px] tracking-widest',
  'px-2 py-1 rounded-md whitespace-nowrap'
);

const QUIET_MONO = 'font-mono text-[10.5px] text-fg-muted';

export function PacketSummary({ packet }: PacketSummaryProps) {
  if (!packet) return null;

  return (
    <section
      aria-label="Packet summary"
      className={cn(
        'shrink-0 relative overflow-hidden',
        'px-3 py-2.5',
        'bg-surface rounded-lg shadow-sm'
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute inset-y-0 left-0 w-0.5 bg-accent"
        aria-hidden="true"
      ></div>

      <dl className="flex items-center gap-3.5">
        <div className="shrink-0">
          <dt className="sr-only">Direction</dt>
          <dd
            className={cn(
              PILL_STYLE,
              'text-accent dark:text-accent-hover bg-accent/16'
            )}
          >
            {packet.direction.toUpperCase()}
          </dd>
        </div>

        <div className="min-w-0 flex flex-col gap-px">
          <dt className="sr-only">Parameter</dt>
          <dd className="font-medium text-[19px] leading-[1.1] tracking-tight truncate">
            {packet.parameterId.value.name}
          </dd>
          <dd className={QUIET_MONO}>
            {toString16Bit(packet.parameterId.value.pid) +
              ' · ' +
              packet.commandClass.value.name}
          </dd>
        </div>

        <div className="ml-auto shrink-0">
          <dt className="sr-only">Source to destination</dt>
          <dd className={cn(QUIET_MONO, 'text-right leading-snug')}>
            {packet.sourceUid.value} → {packet.destinationUid.value}
          </dd>
        </div>

        <div className="shrink-0">
          <dt className="sr-only">Checksum</dt>
          <dd
            className={cn(
              PILL_STYLE,
              packet.validChecksum
                ? 'text-success bg-success/16'
                : 'text-danger-vivid bg-danger-vivid/16'
            )}
          >
            {packet.validChecksum ? 'CHECKSUM OK' : 'CHECKSUM FAIL'}
          </dd>
        </div>
      </dl>
    </section>
  );
}

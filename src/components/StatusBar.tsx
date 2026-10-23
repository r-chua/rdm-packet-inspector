import { cn } from '../lib/utils';
import { type FieldEntry } from '../parser/fields';

const SHORTCUTS = [
  { keys: '← → ↑ ↓', action: 'move byte' },
  { keys: '⏎', action: 'select field' },
  { keys: 'esc', action: 'clear' },
] as const;

type StatusBarProps = {
  byteCount: number | null;
  selectedField: FieldEntry | null;
};

export function StatusBar({ byteCount, selectedField }: StatusBarProps) {
  const byteCountLabel = byteCount !== null ? `${byteCount} bytes` : '';

  const statusLine = selectedField
    ? `${selectedField.name} · bytes ${selectedField.startByte}-${selectedField.endByte}`
    : byteCount !== null
      ? 'no selection'
      : '';

  return (
    <footer
      className={cn(
        'shrink-0 flex items-center gap-4',
        'h-[30px] px-4',
        'font-mono text-[10.5px] text-fg-muted'
      )}
    >
      {SHORTCUTS.map(({ keys, action }) => (
        <span key={action}>
          <kbd className="font-mono">{keys}</kbd>{' '}
          <span className="text-fg-muted/80">{action}</span>
        </span>
      ))}
      <span className="ml-auto">{byteCountLabel}</span>
      <span>{statusLine}</span>
    </footer>
  );
}

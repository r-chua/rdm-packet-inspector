import { cn } from '../lib/utils';
import { type FieldEntry } from '../parser/fields';

type FieldViewProps = {
  fieldEntries: FieldEntry[] | null;
  highlightedField: FieldEntry | null;
  onHighlight: (field: FieldEntry | null) => void;
};

export function FieldView({
  fieldEntries,
  highlightedField,
  onHighlight,
}: FieldViewProps) {
  function renderEntryDetails(entry: FieldEntry) {
    return (
      <div
        key={entry.name}
        onMouseEnter={() => onHighlight(entry)}
        onMouseLeave={() => onHighlight(null)}
        className={cn(
          entry === highlightedField ? 'bg-yellow-100' : '',
          'p-2 rounded-md'
        )}
      >
        <div className="flex justify-between items-baseline">
          <dt className="text-sm font-medium text-gray-500">{entry.name}</dt>
          <span className="text-xs text-gray-400 font-mono">
            {entry.startByte === entry.endByte
              ? `byte ${entry.startByte}`
              : `bytes ${entry.startByte}–${entry.endByte}`}
          </span>
        </div>
        <dd className="text-sm font-mono text-gray-900 mt-0.5">
          {entry.displayValue}
        </dd>
        {entry.warning && (
          <p className="text-xs text-amber-600 mt-1">{entry.warning}</p>
        )}
      </div>
    );
  }

  function renderFieldEntry(entry: FieldEntry) {
    return (
      <div key={entry.name} className="py-2 px-3">
        {renderEntryDetails(entry)}
        {entry.subFields && entry.subFields.length > 0 && (
          <dl>
            {entry.subFields.map((sub, index) => (
              <div key={`${sub.name}-${index}`} className="ml-4">
                {renderEntryDetails(sub)}
              </div>
            ))}
          </dl>
        )}
      </div>
    );
  }

  return (
    <section className="p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Field View</h2>

      <dl className="divide-y divide-gray-200">
        {fieldEntries?.map((entry) => renderFieldEntry(entry))}
      </dl>
    </section>
  );
}

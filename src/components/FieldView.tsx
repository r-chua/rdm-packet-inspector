import React from 'react';
import { HIGHLIGHT_CLASS, SELECTED_CLASS } from '../lib/styles';
import { cn } from '../lib/utils';
import { type FieldEntry } from '../parser/fields';

type FieldViewProps = {
  fieldEntries: FieldEntry[] | null;
  highlightedField: FieldEntry | null;
  onHighlight: (field: FieldEntry | null) => void;
  selectedField: FieldEntry | null;
  onSelect: (field: FieldEntry | null) => void;
};

export function FieldView({
  fieldEntries,
  highlightedField,
  onHighlight,
  selectedField,
  onSelect,
}: FieldViewProps) {
  const fieldRefs = React.useRef<Map<FieldEntry, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    if (!selectedField) return;
    const fieldElement = fieldRefs.current.get(selectedField);
    fieldElement?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [selectedField]);

  function renderFieldEntry(entry: FieldEntry, index: number) {
    return (
      <div
        key={`${entry.name}-${index}`}
        ref={(el) => {
          if (el) fieldRefs.current.set(entry, el);
          else fieldRefs.current.delete(entry);
        }}
        onMouseOver={(e) => {
          e.stopPropagation();
          onHighlight(entry);
        }}
        onMouseLeave={() => onHighlight(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(entry);
        }}
        data-selected={entry === selectedField}
        data-highlighted={entry === highlightedField}
        className={cn(HIGHLIGHT_CLASS, SELECTED_CLASS, 'py-2 px-3 rounded-md')}
      >
        <dt className="flex justify-between items-baseline text-sm font-medium text-gray-500">
          <span>{entry.name}</span>
          <span className="text-xs text-gray-400 font-mono">
            {entry.startByte === entry.endByte
              ? `byte ${entry.startByte}`
              : `bytes ${entry.startByte}-${entry.endByte}`}
          </span>
        </dt>
        <dd className="text-sm font-mono text-gray-900 mt-0.5">
          {entry.displayValue}
          {entry.warning && (
            <p className="text-xs text-amber-600 mt-1">{entry.warning}</p>
          )}
          {entry.subFields && entry.subFields.length > 0 && (
            <dl className="ml-4">
              {entry.subFields.map((sub, index) =>
                renderFieldEntry(sub, index)
              )}
            </dl>
          )}
        </dd>
      </div>
    );
  }

  return (
    <section className="p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Field View</h2>

      <dl className="divide-y divide-gray-200">
        {fieldEntries?.map((entry, index) => renderFieldEntry(entry, index))}
      </dl>
    </section>
  );
}

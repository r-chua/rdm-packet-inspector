import React from 'react';
import { FOCUSED_CLASS, HIGHLIGHT_CLASS, SELECTED_CLASS } from '../lib/styles';
import { cn, scrollBehavior } from '../lib/utils';
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
  const [focusedFieldIndex, setFocusedFieldIndex] = React.useState<
    number | null
  >(null);
  const [prevFieldEntries, setPrevFieldEntries] = React.useState<
    FieldEntry[] | null
  >(null);

  const fieldRefs = React.useRef<Map<FieldEntry, HTMLDivElement>>(new Map());

  if (fieldEntries !== prevFieldEntries) {
    setPrevFieldEntries(fieldEntries);
    setFocusedFieldIndex(null);
  }

  React.useEffect(() => {
    if (!selectedField) return;
    const fieldElement = fieldRefs.current.get(selectedField);
    fieldElement?.scrollIntoView(scrollBehavior());
  }, [selectedField]);

  React.useEffect(() => {
    if (focusedFieldIndex === null || !fieldEntries) return;
    const fieldElement = fieldRefs.current.get(fieldEntries[focusedFieldIndex]);
    fieldElement?.focus();
  }, [focusedFieldIndex, fieldEntries]);

  function renderFieldEntry(
    entry: FieldEntry,
    index: number,
    isTopLevel: boolean = true
  ) {
    return (
      <div
        key={`${entry.name}-${index}`}
        tabIndex={isTopLevel && focusedFieldIndex === index ? 0 : -1}
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
          if (isTopLevel) {
            setFocusedFieldIndex(index);
          }
        }}
        data-selected={entry === selectedField}
        data-highlighted={entry === highlightedField}
        className={cn(
          HIGHLIGHT_CLASS,
          SELECTED_CLASS,
          FOCUSED_CLASS,
          'py-2 px-3 rounded-md',
          'focus-visible:outline-offset-1'
        )}
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
                renderFieldEntry(sub, index, false)
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

      <dl
        className={cn('divide-y divide-gray-200', FOCUSED_CLASS)}
        tabIndex={focusedFieldIndex === null ? 0 : -1}
        onKeyDown={(e) => {
          if (!fieldEntries || fieldEntries.length === 0) return;

          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              setFocusedFieldIndex((prev) => {
                const next = prev === null ? 0 : prev + 1;
                return next < fieldEntries.length ? next : prev;
              });
              break;
            case 'ArrowUp':
              e.preventDefault();
              setFocusedFieldIndex((prev) => {
                const next = prev === null ? fieldEntries.length - 1 : prev - 1;
                return next >= 0 ? next : prev;
              });
              break;
            case 'Enter':
            case ' ':
              e.preventDefault();
              if (focusedFieldIndex !== null) {
                const field = fieldEntries[focusedFieldIndex];
                onSelect(field);
              }
              break;
            default:
              break;
          }
        }}
      >
        {fieldEntries?.map((entry, index) =>
          renderFieldEntry(entry, index, true)
        )}
      </dl>
    </section>
  );
}

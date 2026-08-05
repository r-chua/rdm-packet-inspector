import React from 'react';
import { cn } from '../lib/utils';
import * as examples from '../parser/examples';

type HexInputProps = {
  onParse: (hexString: string) => void;
};

const EXAMPLE_PACKETS = [
  {
    label: 'Discover Unique',
    value: examples.DISCOVERY_UNIQUE_REQUEST,
  },
  {
    label: 'ACK Timer Response',
    value: examples.GET_DEVICE_INFO_ACK_TIMER_RESPONSE,
  },
  {
    label: 'Nack Reason: Hardware Fault',
    value: examples.NACK_REASON_HARDWARE_FAULT_RESPONSE,
  },
];

export function HexInput({ onParse }: HexInputProps) {
  const [textAreaValue, setTextAreaValue] = React.useState('');

  const handleSubmit = () => {
    onParse(textAreaValue);
  };

  const handleClear = () => {
    setTextAreaValue('');
    onParse(''); // Clear the parsed data as well
  };

  const selectValue = EXAMPLE_PACKETS.some(
    (packet) => packet.value === textAreaValue
  )
    ? textAreaValue
    : '';

  return (
    <section className="p-4" aria-labelledby="hex-input-title">
      <h2 id="hex-input-title" className="pane-label mb-2">
        Hex Input
      </h2>
      <form aria-labelledby="hex-input-title">
        <label
          htmlFor="hex-input"
          className="block text-sm font-medium text-fg-muted mb-1"
        >
          Packet Data
        </label>
        <textarea
          id="hex-input"
          className={cn(
            'mt-1 block w-full rounded-md',
            'border border-border sm:text-sm',
            'focus:border-focus focus:ring-focus',
            'font-mono tracking-[0.04em] leading-relaxed'
          )}
          rows={4}
          spellCheck={false}
          autoComplete="off"
          placeholder="Enter hex data here..."
          value={textAreaValue}
          onChange={(e) => {
            setTextAreaValue(e.target.value);
          }}
        />

        <div className="mt-2 flex gap-2 items-center">
          <div className="flex-initial">
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className={cn(
                'mt-2 px-4 py-2 rounded-md',
                'bg-accent text-on-accent',
                'hover:bg-accent-hover',
                'focus:ring-2 focus:ring-offset-2 focus:ring-focus'
              )}
            >
              Submit
            </button>

            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'mt-2 ml-6 px-4 py-2 rounded-md',
                'bg-surface',
                'text-fg',
                'border border-border',
                'hover:bg-surface-subtle',
                'focus:ring-2 focus:ring-offset-2 focus:ring-focus'
              )}
            >
              Reset
            </button>
          </div>

          <div className="flex-initial ml-auto mr-4">
            <label
              htmlFor="hex-select"
              className="text-sm font-medium text-fg-muted mr-4"
            >
              Example Packets
            </label>
            <select
              id="hex-select"
              className={cn(
                'px-4',
                'mt-1 rounded-md',
                'border border-border sm:text-sm',
                'focus:border-focus focus:ring-focus'
              )}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setTextAreaValue(selectedValue);
                onParse(selectedValue);
              }}
              value={selectValue}
            >
              <option value="">Select an example packet</option>
              {EXAMPLE_PACKETS.map((packet) => (
                <option key={packet.label} value={packet.value}>
                  {packet.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </section>
  );
}

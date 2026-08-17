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
    <section className="p-4" aria-label="Hex Input">
      <form aria-label="Hex Input" className="flex gap-4">
        <textarea
          id="hex-input"
          className={cn(
            'flex-1 min-w-0',
            'block w-full rounded-md',
            'border border-border sm:text-sm',
            'caret-accent',
            'focus-visible:border-focus',
            'font-mono tracking-[0.04em] leading-relaxed'
          )}
          rows={4}
          spellCheck={false}
          autoComplete="off"
          placeholder="Enter hex data here..."
          aria-label="Packet Data"
          value={textAreaValue}
          onChange={(e) => {
            setTextAreaValue(e.target.value);
          }}
        />

        <div className="flex flex-col flex-none w-[210px] gap-2">
          <div>
            <select
              id="hex-select"
              className={cn(
                'px-4 py-2',
                'w-full min-w-0',
                'rounded-md',
                'border border-border sm:text-sm',
                'focus-visible:outline-2 focus-visible:outline-offset-2',
                'focus-visible:outline-focus'
              )}
              aria-label="Example Packets"
              onChange={(e) => {
                const selectedValue = e.target.value;
                setTextAreaValue(selectedValue);
                onParse(selectedValue);
              }}
              value={selectValue}
            >
              <option value="">Example Packets</option>
              {EXAMPLE_PACKETS.map((packet) => (
                <option key={packet.label} value={packet.value}>
                  {packet.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5">
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className={cn(
                'flex-1',
                'px-2 rounded-md',
                'bg-transparent',
                'border border-accent',
                'text-accent text-sm',
                'hover:bg-accent/10 active:bg-accent/20',
                'focus-visible:outline-2 focus-visible:outline-offset-2 ',
                'focus-visible:outline-focus'
              )}
            >
              Submit
            </button>

            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'flex-none',
                'px-2 rounded-md',
                'bg-transparent',
                'text-fg-muted text-sm',
                'border border-border',
                'hover:bg-fg/8 active:bg-fg/15',
                'focus-visible:outline-2 focus-visible:outline-offset-2 ',
                'focus-visible:outline-focus'
              )}
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

import React from 'react';
import { cn } from '../lib/utils';

type HexInputProps = {
  onParse: (hexString: string) => void;
};

const EXAMPLE_PACKETS = [
  {
    label: 'Discover Unique',
    value:
      'cc 01 24 ff ff ff ff ff ff 01 02 03 04 05 06 01 01 00 00 00 10 ' +
      '00 01 0c 00 00 00 00 00 00 ff ff ff ff ff ff 0d 19',
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
    <section className="p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Hex Input</h2>
      <form>
        <label
          htmlFor="hex-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Packet Data
        </label>
        <textarea
          id="hex-input"
          className={cn(
            'mt-1 block w-full rounded-md',
            'border-gray-300 shadow-sm sm:text-sm',
            'focus:border-indigo-500 focus:ring-indigo-500'
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
              type="button"
              onClick={handleSubmit}
              className={cn(
                'mt-2 px-4 py-2 rounded-md shadow-sm',
                'bg-indigo-500 text-white',
                'hover:bg-indigo-600',
                'focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              )}
            >
              Submit
            </button>

            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'mt-2 ml-6 px-4 py-2 rounded-md shadow-sm',
                'bg-red-500 text-white',
                'hover:bg-red-600',
                'focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              )}
            >
              Reset
            </button>
          </div>

          <div className="flex-initial ml-auto mr-4">
            <label
              htmlFor="hex-select"
              className="text-sm font-medium text-gray-700 mr-4"
            >
              Example Packets
            </label>
            <select
              id="hex-select"
              className={cn(
                'px-4',
                'mt-1 rounded-md',
                'border-gray-300 shadow-sm sm:text-sm',
                'focus:border-indigo-500 focus:ring-indigo-500'
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

import React from 'react';
import { cn } from '../lib/utils';

type HexInputProps = {
  onParse: (hexString: string) => void;
};

export function HexInput({ onParse }: HexInputProps) {
  const [textAreaValue, setTextAreaValue] = React.useState('');

  const handleSubmit = () => {
    onParse(textAreaValue);
  };

  const handleClear = () => {
    setTextAreaValue('');
    onParse(''); // Clear the parsed data as well
  };

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
          onChange={(e) => setTextAreaValue(e.target.value)}
        />

        <div>
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
      </form>
    </section>
  );
}

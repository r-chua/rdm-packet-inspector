import React from 'react';
import { FieldView } from './FieldView.tsx';
import { HexInput } from './HexInput.tsx';
import { HexView } from './HexView.tsx';
import type { ParseResult } from '../parser/types.ts';
import { parseRdmPacket } from '../parser/parse.ts';

export function PacketInspector() {
  const [parseResult, setParseResult] = React.useState<ParseResult | null>(
    null
  );

  const handleParse = (hexString: string) => {
    setParseResult(parseRdmPacket(hexString));
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-900 text-white">
        <h1 className="text-2xl font-bold p-4">RDM Packet Inspector</h1>
      </div>

      <div className="flex flex-col flex-1 min-h-0 p-4 gap-4">
        <div className="bg-blue-200 border rounded-lg">
          <HexInput onParse={handleParse} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="overflow-auto bg-green-200 border rounded-lg">
            <HexView
              rawBytes={parseResult?.rawBytes || null}
              packet={parseResult?.success ? parseResult.packet : null}
            />
          </div>
          <div className="overflow-auto bg-amber-200 border rounded-lg">
            <FieldView
              packet={parseResult?.success ? parseResult.packet : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

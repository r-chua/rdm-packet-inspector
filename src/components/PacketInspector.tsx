import { FieldView } from './FieldView.tsx';
import { HexInput } from './HexInput.tsx';
import { HexView } from './HexView.tsx';

export function PacketInspector() {
  return (
    <>
      <div>
        <h1>Packet Inspector</h1>
        <HexInput />
      </div>

      <div>
        <HexView />
        <FieldView />
      </div>
    </>
  );
}

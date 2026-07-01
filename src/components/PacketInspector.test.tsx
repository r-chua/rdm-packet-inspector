import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PacketInspector } from './PacketInspector';

describe('PacketInspector', () => {
  it('renders the component', () => {
    render(<PacketInspector />);
    expect(screen.getByText('RDM Packet Inspector')).toBeInTheDocument();
  });
});

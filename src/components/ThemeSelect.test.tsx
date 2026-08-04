import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { ThemeSelect } from './ThemeSelect';

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) =>
      listeners.add(handler),
    removeEventListener: (
      _: string,
      handler: (e: MediaQueryListEvent) => void
    ) => listeners.delete(handler),
    dispatchEvent: vi.fn(),
  }));
  return {
    fire: (matches: boolean) =>
      listeners.forEach((h) => h({ matches } as MediaQueryListEvent)),
  };
}

describe('ThemeSelect', () => {
  it('should render the theme select component', () => {
    // Render the ThemeSelect component and check if it renders correctly
    const { getByLabelText } = render(<ThemeSelect />);
    const selectElement = getByLabelText(/Theme/i);
    expect(selectElement).toBeInTheDocument();
  });

  it('should default to system theme when no preference is set', () => {
    mockMatchMedia(true); // the OS prefers dark

    render(<ThemeSelect />);

    expect(screen.getByLabelText(/theme/i)).toHaveValue('system');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('should apply the selected theme and persist it in localStorage', async () => {
    render(<ThemeSelect />);

    const selectElement = screen.getByLabelText<HTMLSelectElement>(/theme/i);
    // Change to dark theme
    await userEvent.selectOptions(selectElement, 'dark');

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    // Change to light theme
    await userEvent.selectOptions(selectElement, 'light');

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});

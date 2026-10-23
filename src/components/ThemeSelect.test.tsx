import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
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

beforeEach(() => {
  mockMatchMedia(false); // default to light theme for tests
  delete document.documentElement.dataset.theme; // reset theme before each test
  localStorage.clear(); // stored preference must not leak between tests
});

describe('ThemeSelect', () => {
  it('should render the theme select component', () => {
    // Render the ThemeSelect component and check if it renders correctly
    render(<ThemeSelect />);
    const radioGroup = screen.getByRole('group', { name: /theme/i });
    expect(radioGroup).toBeInTheDocument();
  });

  it('should default to system theme when no preference is set', () => {
    mockMatchMedia(true); // the OS prefers dark

    render(<ThemeSelect />);

    expect(screen.getByRole('radio', { name: /system/i })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('should apply the selected theme and persist it in localStorage', async () => {
    render(<ThemeSelect />);

    // Change to dark theme
    await userEvent.click(screen.getByRole('radio', { name: /dark/i }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    // Change to light theme
    await userEvent.click(screen.getByRole('radio', { name: /light/i }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should load with the correct theme based on localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeSelect />);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('radio', { name: /dark/i })).toBeChecked();
  });

  it('should clear the preference when system is selected', async () => {
    render(<ThemeSelect />);

    // Change to dark theme first
    await userEvent.click(screen.getByRole('radio', { name: /dark/i }));
    expect(localStorage.getItem('theme')).toBe('dark');

    // Now change to system theme
    await userEvent.click(screen.getByRole('radio', { name: /system/i }));
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('should respond to system theme changes when set to system', () => {
    const { fire } = mockMatchMedia(false); // the OS prefers light

    render(<ThemeSelect />);

    // Ensure it's set to system
    expect(screen.getByRole('radio', { name: /system/i })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('light');

    // Simulate a system theme change to dark
    fire(true);
    expect(document.documentElement.dataset.theme).toBe('dark');

    // Simulate a system theme change back to light
    fire(false);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should not respond to system theme changes when set to dark or light', () => {
    const { fire } = mockMatchMedia(false); // the OS prefers light
    localStorage.setItem('theme', 'dark');

    render(<ThemeSelect />);

    // Ensure it's set to dark
    expect(screen.getByRole('radio', { name: /dark/i })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('dark');

    // Simulate a system theme change to light
    fire(false);
    // The theme should still be dark
    expect(document.documentElement.dataset.theme).toBe('dark');

    // Simulate a system theme change to dark
    fire(true);
    // The theme should still be dark
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('should be a single tab stop where arrow keys move the selection', async () => {
    const user = userEvent.setup();
    render(<ThemeSelect />);

    // The whole group is one tab stop: Tab lands on the checked radio
    await user.tab();
    expect(screen.getByRole('radio', { name: /system/i })).toHaveFocus();

    // Arrow keys move focus AND selection together
    await user.keyboard('{ArrowRight}');
    const lightRadio = screen.getByRole('radio', { name: /light/i });
    expect(lightRadio).toHaveFocus();
    expect(lightRadio).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');

    // Arrow back re-selects system and clears the stored preference
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: /system/i })).toBeChecked();
    expect(localStorage.getItem('theme')).toBeNull();

    // Tab leaves the group: unchecked radios are not tab stops
    await user.tab();
    expect(document.body).toHaveFocus();
  });
});

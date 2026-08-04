import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// jsdom implements neither of these, and the selection/scroll effects call
// them: scrollBehavior() reads window.matchMedia, and the scroll-to effects
// call scrollIntoView. Without stubs, any test that triggers a selection throws.
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Element.prototype.scrollIntoView = vi.fn();

beforeEach(() => {
  // Reset the theme to system before each test, so that tests don't interfere with each other.
  localStorage.removeItem('theme');
});

afterEach(() => {
  cleanup();

  vi.clearAllMocks();
});

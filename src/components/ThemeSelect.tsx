import React from 'react';
import { cn } from '../lib/utils';

const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
type ThemeOption = (typeof THEME_OPTIONS)[number];

function isValidThemeOption(value: string): value is ThemeOption {
  return THEME_OPTIONS.includes(value as ThemeOption);
}

export function ThemeSelect() {
  const readThemePref = () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      return 'dark';
    } else if (theme === 'light') {
      return 'light';
    } else {
      return 'system';
    }
  };
  const [theme, setTheme] = React.useState<ThemeOption>(() => readThemePref());

  React.useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else if (theme === 'light') {
      document.documentElement.dataset.theme = 'light';
    } else {
      document.documentElement.dataset.theme = matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
        ? 'dark'
        : 'light';
    }
  }, [theme]);

  return (
    <div className="flex-initial ml-auto mr-4">
      <label
        htmlFor="theme-select"
        className="text-sm font-medium text-fg-muted mr-4 sr-only"
      >
        Theme
      </label>
      <select
        id="theme-select"
        className={cn(
          'px-4',
          'mt-1 rounded-md',
          'border border-border shadow-sm sm:text-sm',
          'focus:border-focus focus:ring-focus'
        )}
        onChange={(e) => {
          const selectedValue = e.target.value;
          if (isValidThemeOption(selectedValue)) {
            setTheme(selectedValue);
            if (selectedValue === 'system') {
              localStorage.removeItem('theme');
            } else {
              localStorage.setItem('theme', selectedValue);
            }
          }
        }}
        value={theme}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

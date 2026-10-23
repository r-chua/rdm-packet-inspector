import React from 'react';
import { cn } from '../lib/utils';

const THEME_OPTIONS = ['system', 'light', 'dark'] as const;
type ThemeOption = (typeof THEME_OPTIONS)[number];

function isValidThemeOption(value: string): value is ThemeOption {
  return THEME_OPTIONS.includes(value as ThemeOption);
}

export function ThemeSelect() {
  const readThemePref = () => {
    const theme = localStorage.getItem('theme');
    if (theme !== null && isValidThemeOption(theme)) {
      return theme;
    }
    return 'system';
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

  const handleThemeSelect = (value: ThemeOption) => {
    setTheme(value);
    if (value === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', value);
    }
  };

  const renderThemeOption = (value: ThemeOption) => {
    return (
      <label
        key={value}
        className={cn(
          'px-2.5 text-xs font-medium leading-6 uppercase tracking-wide',
          'first-of-type:rounded-l-md last-of-type:rounded-r-md',
          'cursor-pointer select-none transition-colors',
          'not-has-checked:hover:bg-accent/8',
          'has-checked:bg-accent/15 has-checked:text-accent has-checked:inset-ring',
          'has-focus-visible:outline-2 has-focus-visible:outline-focus has-focus-visible:-outline-offset-2'
        )}
      >
        <input
          type="radio"
          name="theme"
          value={value}
          checked={theme === value}
          onChange={() => handleThemeSelect(value)}
          className="sr-only"
        />
        {value}
      </label>
    );
  };

  return (
    <div className="flex-initial ml-auto mr-4">
      <fieldset
        className={cn(
          'inline-flex h-6.5 items-center',
          'rounded-md border border-border',
          'overflow-hidden divide-x divide-border'
        )}
      >
        <legend className="sr-only">Theme</legend>
        {THEME_OPTIONS.map(renderThemeOption)}
      </fieldset>
    </div>
  );
}

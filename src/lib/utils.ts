import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(args));
}

export function scrollBehavior(): ScrollIntoViewOptions {
  return {
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
    inline: 'nearest',
    block: 'nearest',
  };
}

export function toString8Bit(value: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;
}

export function toString16Bit(value: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(4, '0')}`;
}

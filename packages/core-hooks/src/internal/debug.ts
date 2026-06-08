/**
 * Debug logging utilities for core-hooks.
 * Only logs in development mode to reduce production console noise.
 */

const isDev =
  typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : true; // Default to true for browser without process

const PREFIX = '[core-hooks]';

export const debug = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(PREFIX, ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(PREFIX, ...args);
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(PREFIX, ...args);
  },
};

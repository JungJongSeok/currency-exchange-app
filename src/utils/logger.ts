/**
 * Ultra-thin logger. Wraps `console.log` / `console.error` behind a tagged
 * interface so we can swap in a remote sink later without touching callers.
 */

type LogFn = (message: string, ...args: unknown[]) => void;

export interface Logger {
  readonly info: LogFn;
  readonly warn: LogFn;
  readonly error: LogFn;
}

const tag = '[CurrencyExchangeApp]';

export const logger: Logger = {
  info: (message, ...args) => {
    console.log(`${tag} ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`${tag} ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`${tag} ${message}`, ...args);
  },
};

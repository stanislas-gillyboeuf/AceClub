export const logger = {
  debug: (...args: unknown[]): void => {
    if (__DEV__) console.log(...args);
  },
  info: (...args: unknown[]): void => {
    if (__DEV__) console.info(...args);
  },
  warn: (...args: unknown[]): void => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    if (__DEV__) console.error(...args);
  },
};

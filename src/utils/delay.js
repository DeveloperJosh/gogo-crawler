import { logError } from './logger.js';

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const withRetry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i < retries - 1) {
          logError(`Retrying operation... Attempt ${i + 2}/${retries}`);
          await new Promise(res => setTimeout(res, delay));
        } else {
          throw err;
        }
      }
    }
  };
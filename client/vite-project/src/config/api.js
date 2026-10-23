/**
 * Single source of truth for backend URLs and the HTTP client.
 *
 * Override per environment with a `.env` file:
 *   VITE_API_URL=http://127.0.0.1:3010
 * and for production point it at the deployed service:
 *   VITE_API_URL=https://coursecraft-api.onrender.com
 */
import axios from 'axios';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'
).replace(/\/+$/, '');

export const API_ROUTES = {
  login: `${API_BASE_URL}/api/user/login`,
  signup: `${API_BASE_URL}/api/user/signup`,
  generateQuestions: `${API_BASE_URL}/api/user/generate-questions`,
  generateModule: `${API_BASE_URL}/api/user/generate-module`,
  getNotes: `${API_BASE_URL}/api/user/get-notes`,
  userByToken: (token) => `${API_BASE_URL}/api/v2/user/token/${token}`,
};

/** Generations can take a while — the course module took ~40s in testing. */
export const API_TIMEOUT_MS = 120000;

/**
 * Free hosts (Render) shut the container down after ~15 minutes of
 * inactivity. The first request after that wakes it up and the host answers
 * 502/503 while the service boots. Those are retried so the user sees a
 * slow request instead of an error.
 */
const COLD_START_STATUSES = [502, 503];
// Measured cold start on Render's free plan is 30-50s, so the budget has to
// be longer than that. Retries are flat 5s apart rather than backing off, and
// only happen while the host answers 502/503 almost instantly.
const COLD_START_RETRIES = 12;
const COLD_START_DELAY_MS = 5000;

/**
 * A cold start fails immediately. A request that fails *after* a long wait
 * was a real timeout, and retrying it would run the AI generation twice
 * and burn the Gemini quota, so only fast failures are retried.
 */
const COLD_START_MAX_ELAPSED_MS = 15000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async (method, url, body, { retries = COLD_START_RETRIES } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const startedAt = Date.now();
    try {
      return await axios.request({
        method,
        url,
        data: body,
        timeout: API_TIMEOUT_MS,
      });
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const elapsed = Date.now() - startedAt;

      if (
        !COLD_START_STATUSES.includes(status) ||
        attempt === retries ||
        elapsed > COLD_START_MAX_ELAPSED_MS
      ) {
        throw error;
      }

      const delay = COLD_START_DELAY_MS;
      console.warn(
        `[api] ${status} from ${url} — retrying in ${delay / 1000}s (the host may be waking up)`
      );
      await sleep(delay);
    }
  }

  throw lastError;
};

export const apiPost = (url, body, options) => request('post', url, body, options);
export const apiGet = (url, options) => request('get', url, undefined, options);

export default API_BASE_URL;

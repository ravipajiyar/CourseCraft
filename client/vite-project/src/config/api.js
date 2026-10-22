/**
 * Single source of truth for backend URLs.
 *
 * Override per environment with a `.env` file:
 *   VITE_API_URL=http://127.0.0.1:3000
 * and for production point it at the deployed service:
 *   VITE_API_URL=https://coursecraft-api.onrender.com
 */
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

export default API_BASE_URL;

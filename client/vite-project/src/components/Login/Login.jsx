import { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaXmark, FaArrowRight, FaLock } from 'react-icons/fa6';
import { useUser } from '../../contexts/Usercontext';
import { API_ROUTES } from '../../config/api';

export default function Login({ close, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        API_ROUTES.login,
        { email, password }
      );

      const token = response.data.token;
      localStorage.setItem('token', token);

      // The API nests the user under `data`, but older builds returned it flat.
      const user = response.data.data?.user ?? response.data.user ?? null;

      await login(user);

      if (onLogin) onLogin(user?.name || user?.email || email);
      close();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Invalid login credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink-950/80 p-4 backdrop-blur-md animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl shadow-lift animate-scale-in">
        {/* top glow bar */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-500/25 blur-3xl" />

        <button
          onClick={close}
          aria-label="Close login"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-chalk-muted transition-colors hover:bg-white/10 hover:text-chalk"
        >
          <FaXmark className="h-4 w-4" />
        </button>

        <div className="relative p-8 sm:p-9">
          <div className="mb-7 flex flex-col items-center text-center">
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_12px_34px_-12px_rgba(139,92,246,0.95)]">
              <FaLock className="h-6 w-6" />
            </span>
            <h2 className="text-2xl font-extrabold text-chalk">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-chalk-muted">
              Sign in to keep your courses and progress in one place.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-chalk-muted"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-chalk-muted"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="field pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-chalk-faint transition-colors hover:text-chalk"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full py-3.5 text-[0.95rem]"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <FaArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-chalk-faint">
            CourseCraft is a demo project — accounts are stored locally on your
            machine.
          </p>
        </div>
      </div>
    </div>
  );
}

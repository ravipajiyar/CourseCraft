import { Link } from 'react-router-dom';

/**
 * Brand mark + wordmark used in the navbar and footer.
 */
export default function Logo({ compact = false, className = '' }) {
  return (
    <Link
      to="/"
      aria-label="CourseCraft home"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-gradient shadow-[0_8px_24px_-8px_rgba(139,92,246,0.9)] transition-transform duration-500 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 4 L21 8.5 L12 13 L3 8.5 Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M6.5 10.5 V14.8 C6.5 16.6 8.95 18 12 18 C15.05 18 17.5 16.6 17.5 14.8 V10.5 L12 13.4 Z"
            fill="white"
            fillOpacity="0.6"
          />
        </svg>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </span>
      {!compact && (
        <span className="text-[1.35rem] font-extrabold tracking-tight text-chalk">
          Course
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-iris-300 to-aqua-300">
            Craft
          </span>
        </span>
      )}
    </Link>
  );
}

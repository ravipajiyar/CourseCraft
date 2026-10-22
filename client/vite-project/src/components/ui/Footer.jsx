import { Link } from 'react-router-dom';
import Logo from './Logo';
import {
  FaGithub,
  FaTwitter,
  FaLinkedinIn,
  FaDiscord,
  FaGraduationCap,
} from 'react-icons/fa6';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'About', to: '/about' },
      { label: 'My Courses', to: '/courselist' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Start a course', to: '/' },
      { label: 'Assessment', to: '/genchat' },
      { label: 'Course library', to: '/courselist' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/about' },
      { label: 'How it works', to: '/features' },
      { label: 'Support', to: '/about' },
    ],
  },
];

const socials = [
  { icon: FaGithub, label: 'GitHub' },
  { icon: FaTwitter, label: 'Twitter' },
  { icon: FaLinkedinIn, label: 'LinkedIn' },
  { icon: FaDiscord, label: 'Discord' },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-950/60 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-chalk-muted">
              We find the gaps in your knowledge, then build a course that
              closes them — module by module, in the order that actually makes
              sense for you.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-chalk-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/40 hover:text-chalk"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-chalk">
                  {col.title}
                </h4>
                <ul className="-my-1">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="inline-block py-2 text-[0.95rem] text-chalk-muted transition-colors duration-200 hover:text-brand-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-sm text-chalk-faint">
            © {new Date().getFullYear()} CourseCraft. Crafted for curious
            minds.
          </p>
          <div className="flex items-center gap-2 text-sm text-chalk-faint">
            <FaGraduationCap className="h-4 w-4 text-brand-300" />
            Built with React, Tailwind &amp; Gemini
          </div>
        </div>
      </div>
    </footer>
  );
}

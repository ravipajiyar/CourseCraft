import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaXmark, FaArrowRight, FaCircleUser } from 'react-icons/fa6';
import Logo from '../ui/Logo';
import Login from '../Login/Login';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'About', to: '/about' },
  { label: 'My Courses', to: '/courselist' },
];

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (loggedInUsername) => {
    setIsLoggedIn(true);
    setUsername(loggedInUsername);
    setShowLogin(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const go = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/10 bg-ink-950/70 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Logo />

          {/* desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-chalk'
                      : 'text-chalk-muted hover:text-chalk'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <div className="flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] py-1.5 pl-3 pr-4 backdrop-blur-md">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-white">
                  <FaCircleUser className="h-4 w-4" />
                </span>
                <span className="max-w-[10rem] truncate text-sm font-semibold text-chalk">
                  {username}
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="btn-ghost px-5 py-2.5 text-sm"
                >
                  Log in
                </button>
                <button
                  onClick={() => go('/')}
                  className="btn-brand px-5 py-2.5 text-sm"
                >
                  Get started
                  <FaArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* mobile toggle */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-chalk md:hidden"
          >
            {menuOpen ? (
              <FaXmark className="h-5 w-5" />
            ) : (
              <FaBars className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* mobile drawer */}
        <div
          className={`overflow-hidden border-t border-white/10 bg-ink-950/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
            menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 px-5 py-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-100'
                      : 'text-chalk-muted hover:bg-white/5 hover:text-chalk'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="!mt-4 flex gap-3 border-t border-white/10 pt-4">
              {isLoggedIn ? (
                <div className="flex w-full items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3">
                  <FaCircleUser className="text-brand-200" />
                  <span className="text-sm font-semibold">{username}</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowLogin(true);
                    }}
                    className="btn-ghost flex-1 px-4 py-3 text-sm"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => go('/')}
                    className="btn-brand flex-1 px-4 py-3 text-sm"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showLogin && (
        <Login close={() => setShowLogin(false)} onLogin={handleLogin} />
      )}
    </>
  );
}

/**
 * Glass feature card with a gradient icon badge and hover glow.
 */
export default function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = 'brand',
  className = '',
  delay = 0,
}) {
  const accents = {
    brand: {
      ring: 'from-brand-400/90 to-iris-500/90',
      glow: 'group-hover:shadow-[0_0_44px_-6px_rgba(139,92,246,0.75)]',
      text: 'text-brand-200',
    },
    aqua: {
      ring: 'from-aqua-300/90 to-iris-400/90',
      glow: 'group-hover:shadow-[0_0_44px_-6px_rgba(34,211,238,0.7)]',
      text: 'text-aqua-300',
    },
    amber: {
      ring: 'from-amber-300/90 to-brand-400/90',
      glow: 'group-hover:shadow-[0_0_44px_-6px_rgba(251,191,36,0.65)]',
      text: 'text-amber-300',
    },
    mint: {
      ring: 'from-mint-400/90 to-aqua-400/90',
      glow: 'group-hover:shadow-[0_0_44px_-6px_rgba(52,211,153,0.65)]',
      text: 'text-mint-400',
    },
  };
  const a = accents[accent] ?? accents.brand;

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.07] ${a.glow} ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* corner glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

      <div
        className={`relative mb-5 inline-grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br ${a.ring} p-[1.5px] shadow-lg transition-transform duration-500 group-hover:scale-110`}
      >
        <span className="grid h-full w-full place-items-center rounded-[0.9rem] bg-ink-900/90 backdrop-blur">
          <Icon className={`h-6 w-6 ${a.text}`} />
        </span>
      </div>

      <h3 className="relative mb-2.5 text-xl font-bold text-chalk">{title}</h3>
      <p className="relative text-[0.97rem] leading-relaxed text-chalk-muted">
        {description}
      </p>
    </article>
  );
}

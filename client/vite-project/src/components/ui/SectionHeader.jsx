/**
 * Consistent section heading: eyebrow pill + gradient title + subtitle.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  const isCenter = align === 'center';

  return (
    <div
      className={`${isCenter ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl text-left'} ${className}`}
    >
      {eyebrow && (
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-aqua-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)]" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-4xl font-extrabold leading-[1.1] text-chalk md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-pretty text-lg leading-relaxed text-chalk-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}

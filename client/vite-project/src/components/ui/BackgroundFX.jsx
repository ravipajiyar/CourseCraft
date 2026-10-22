/**
 * Ambient animated background shared by every page: aurora blobs,
 * a faint grid, and a soft vignette. Purely decorative.
 */
export default function BackgroundFX({ variant = 'default' }) {
  const blobs =
    variant === 'compact'
      ? [
          { cls: 'top-[-6rem] left-[-4rem] h-72 w-72 bg-brand-500/25', delay: '' },
          { cls: 'top-[6rem] right-[-6rem] h-80 w-80 bg-aqua-400/20', delay: 'animation-delay-2000' },
          { cls: 'bottom-[-8rem] left-1/3 h-80 w-80 bg-iris-500/25', delay: 'animation-delay-4000' },
        ]
      : [
          { cls: 'top-[-10rem] left-[-6rem] h-[28rem] w-[28rem] bg-brand-500/25', delay: '' },
          { cls: 'top-[12%] right-[-8rem] h-[32rem] w-[32rem] bg-aqua-400/20', delay: 'animation-delay-2000' },
          { cls: 'bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] bg-iris-500/25', delay: 'animation-delay-4000' },
          { cls: 'bottom-[18%] right-1/4 h-64 w-64 bg-amber-300/10', delay: 'animation-delay-6000' },
        ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-ink-950" />

      {/* aurora blobs */}
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[110px] animate-blob ${b.cls} ${b.delay}`}
        />
      ))}

      {/* grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.55] mask-fade-b" />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(5,5,10,0.75)_85%)]" />
    </div>
  );
}

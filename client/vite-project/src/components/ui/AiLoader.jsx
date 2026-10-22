/**
 * Branded loading state used while the AI generates content.
 * Replaces the generic spinner with something that feels on-brand.
 */
export default function AiLoader({
  label = 'Generating your learning experience',
  hint,
  size = 'md',
}) {
  const box = size === 'sm' ? 'h-12 w-12' : 'h-16 w-16';
  const inner = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <div className="flex flex-col items-center justify-center gap-5 text-center">
      <div className="relative grid place-items-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-brand-500/40" />
        <span
          className="absolute inset-0 animate-spin-slow rounded-2xl border-2 border-transparent"
          style={{
            borderTopColor: '#8b5cf6',
            borderRightColor: '#22d3ee',
          }}
        />
        <span
          className={`relative grid ${box} place-items-center rounded-2xl bg-brand-gradient shadow-[0_10px_40px_-10px_rgba(139,92,246,0.9)]`}
        >
          <span className="flex items-end gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white animate-bounce-dot"
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
          <span className={`sr-only ${inner}`} />
        </span>
      </div>

      <div>
        <p className="text-lg font-semibold text-chalk">{label}</p>
        {hint && (
          <p className="mt-1.5 max-w-sm text-sm text-chalk-muted">{hint}</p>
        )}
      </div>
    </div>
  );
}

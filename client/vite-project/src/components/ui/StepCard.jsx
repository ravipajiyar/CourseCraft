import { FaArrowRight } from 'react-icons/fa6';

/**
 * Numbered step card used by the "How it works" section.
 */
export default function StepCard({ index, icon: Icon, title, description }) {
  return (
    <div className="group relative">
      {/* connector */}
      <div className="absolute left-[2.1rem] top-[3.4rem] hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-brand-500/50 via-iris-500/30 to-transparent lg:block" />

      <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-400/40 hover:bg-white/[0.07]">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-brand-500/25" />
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_10px_30px_-10px_rgba(139,92,246,0.9)]">
              <Icon className="h-6 w-6" />
            </span>
          </div>
          <span className="font-mono text-sm font-semibold text-chalk-faint">
            0{index}
          </span>
        </div>

        <h3 className="mb-2.5 text-xl font-bold text-chalk">{title}</h3>
        <p className="text-[0.97rem] leading-relaxed text-chalk-muted">
          {description}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-200 opacity-0 transition-all duration-500 group-hover:opacity-100">
          Learn more <FaArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

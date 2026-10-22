import Navbar from '../components/Navbar/Navbar';
import CourseSelector from '../components/CourseSelector/CourseSelector';
import BackgroundFX from '../components/ui/BackgroundFX';
import Footer from '../components/ui/Footer';
import SectionHeader from '../components/ui/SectionHeader';
import FeatureCard from '../components/ui/FeatureCard';
import StepCard from '../components/ui/StepCard';
import {
  FaUserGraduate,
  FaBrain,
  FaRoute,
  FaClipboardCheck,
  FaLayerGroup,
  FaBolt,
  FaArrowRight,
  FaCheck,
  FaStar,
} from 'react-icons/fa6';

const features = [
  {
    icon: FaUserGraduate,
    title: 'Built around you',
    description:
      'Your course starts where your knowledge actually ends. Modules are ordered from your real current level upward — never a generic syllabus.',
    accent: 'brand',
  },
  {
    icon: FaBrain,
    title: 'AI-curated curriculum',
    description:
      'Gemini reads every answer you give, weighs it against expert expectations, and decides exactly what you need to learn next.',
    accent: 'aqua',
  },
  {
    icon: FaRoute,
    title: 'A clear learning path',
    description:
      'From fundamentals to advanced topics, every module leads to the next. You always know what to tackle and what comes after it.',
    accent: 'amber',
  },
  {
    icon: FaClipboardCheck,
    title: 'Gap analysis first',
    description:
      'Six targeted questions across basic, intermediate and advanced levels reveal the exact holes in your understanding.',
    accent: 'mint',
  },
  {
    icon: FaLayerGroup,
    title: 'Deep-dive notes',
    description:
      'Every topic ships with rich, structured notes generated on demand — concise enough to read, detailed enough to master.',
    accent: 'brand',
  },
  {
    icon: FaBolt,
    title: 'Instant delivery',
    description:
      'No endless video libraries to sift through. Your personalised course is ready in moments, focused entirely on you.',
    accent: 'aqua',
  },
];

const steps = [
  {
    icon: FaClipboardCheck,
    title: 'Tell us the topic',
    description:
      'Type anything you want to learn — a language, a framework, a maths concept. That is all we need to start.',
  },
  {
    icon: FaBrain,
    title: 'Take the 6-question check',
    description:
      'Our AI probes your understanding at basic, intermediate and advanced levels to pinpoint exactly where you stand.',
  },
  {
    icon: FaLayerGroup,
    title: 'Get your course',
    description:
      'Receive a tailored sequence of modules and topics, ordered from your current level straight up to mastery.',
  },
];

const stats = [
  { value: '6', label: 'Diagnostic questions' },
  { value: '3', label: 'Difficulty tiers probed' },
  { value: '∞', label: 'Topics you can master' },
  { value: '100%', label: 'Tailored to you' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-5 pb-20 pt-32 text-center md:px-8 md:pt-36">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] py-1.5 pl-1.5 pr-4 text-xs font-medium text-chalk-soft backdrop-blur-xl">
          <span className="rounded-full bg-brand-gradient px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
            New
          </span>
          Adaptive AI learning paths, rebuilt for every learner
        </span>

        <h1 className="animate-fade-up delay-150 mt-8 max-w-5xl text-balance text-[2.6rem] font-extrabold leading-[1.06] tracking-tight text-chalk sm:text-6xl lg:text-[4.4rem]">
          Learn what you{' '}
          <span className="text-gradient-animated">actually need</span>, built
          around what you already know.
        </h1>

        <p
          className="animate-fade-up delay-300 mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-chalk-muted md:text-xl"
        >
          CourseCraft assesses your knowledge gaps with AI, then crafts a
          structured course — module by module — that closes exactly those
          gaps.
        </p>

        <div className="animate-fade-up delay-500 mt-12 w-full max-w-3xl">
          <CourseSelector />
        </div>

        <div className="animate-fade-up delay-700 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-chalk-faint">
          {[
            'No credit card needed',
            'Works for any topic',
            'Instantly generated',
          ].map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-mint-400/15 text-mint-400">
                <FaCheck className="h-2.5 w-2.5" />
              </span>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- Stats */}
      <section className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-3xl md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative px-6 py-8 text-center transition-colors duration-300 hover:bg-white/[0.04]"
            >
              <div className="text-gradient-animated text-4xl font-extrabold md:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-chalk-faint">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- How it works */}
      <section className="relative mx-auto w-full max-w-7xl px-5 py-28 md:px-8">
        <SectionHeader
          eyebrow="How it works"
          title={
            <>
              Three steps between curiosity and{' '}
              <span className="text-gradient">competence</span>
            </>
          }
          subtitle="No signup walls, no endless browsing. Just a topic, a quick self-check, and a course shaped around you."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {steps.map((step, i) => (
            <StepCard key={step.title} index={i + 1} {...step} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section className="relative mx-auto w-full max-w-7xl px-5 py-28 md:px-8">
        <SectionHeader
          eyebrow="Why CourseCraft"
          title={
            <>
              Everything you need to{' '}
              <span className="text-gradient">actually learn</span>
            </>
          }
          subtitle="A complete learning loop: diagnose, design, deliver, and deepen — all in one place."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 60} />
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="relative mx-auto w-full max-w-7xl px-5 pb-8 md:px-8">
        <div className="ring-gradient relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-brand-gradient-soft px-8 py-16 text-center backdrop-blur-xl md:py-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-aqua-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mb-6 flex justify-center gap-1 text-amber-300">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className="h-4 w-4" />
              ))}
            </div>
            <h2 className="text-balance text-4xl font-extrabold leading-tight text-chalk md:text-5xl">
              Ready for a course that{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-aqua-300">
                fits you perfectly
              </span>
              ?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-chalk-soft">
              Pick a topic and let the AI do the rest. Your personalised
              curriculum is only a few keystrokes away.
            </p>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-brand mt-9 px-8 py-4 text-[0.98rem]"
            >
              Create my course
              <FaArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

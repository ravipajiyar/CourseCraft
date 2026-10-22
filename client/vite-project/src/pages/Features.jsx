import Navbar from '../components/Navbar/Navbar';
import BackgroundFX from '../components/ui/BackgroundFX';
import Footer from '../components/ui/Footer';
import SectionHeader from '../components/ui/SectionHeader';
import FeatureCard from '../components/ui/FeatureCard';
import {
  FaBrain,
  FaFingerprint,
  FaChartLine,
  FaCircleCheck,
  FaComments,
  FaListCheck,
  FaMedal,
  FaArrowRight,
  FaClipboardCheck,
  FaWandMagicSparkles,
  FaBookOpen,
  FaLayerGroup,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const coreFeatures = [
  {
    icon: FaBrain,
    title: 'AI-powered learning',
    description:
      'Your responses are analysed in real time to shape a learning experience that is genuinely yours.',
    accent: 'brand',
  },
  {
    icon: FaFingerprint,
    title: 'Truly personal content',
    description:
      'No two learners get the same course. Modules adapt to your prior knowledge, pace and goals.',
    accent: 'aqua',
  },
  {
    icon: FaChartLine,
    title: 'Visible progress',
    description:
      'See exactly where you started, what you have closed and which gaps remain open.',
    accent: 'mint',
  },
];

const deepDive = [
  {
    icon: FaClipboardCheck,
    title: 'Smart assessment system',
    body: 'A focused diagnostic gauges your current level with targeted questions instead of guesswork.',
    points: [
      'Adaptive questioning tuned to your responses',
      'Automatic identification of knowledge gaps',
      'Difficulty calibrated for the right challenge',
    ],
    mock: 'assessment',
  },
  {
    icon: FaWandMagicSparkles,
    title: 'Dynamic course generation',
    body: 'Based on your assessment, the AI crafts a unique learning path that keeps evolving as you progress.',
    points: [
      'Custom modules built around your actual needs',
      'Difficulty that adjusts as you get stronger',
      'Topic ordering driven by your goals',
    ],
    mock: 'curriculum',
  },
];

const experience = [
  {
    icon: FaComments,
    title: 'AI tutor on demand',
    body: 'Stuck on a concept? Ask for an explanation and get a clear, structured answer instantly.',
    tint: 'text-aqua-300',
  },
  {
    icon: FaListCheck,
    title: 'Topic deep dives',
    body: 'Every topic opens into a full study guide with examples, definitions and practical detail.',
    tint: 'text-brand-200',
  },
  {
    icon: FaMedal,
    title: 'Milestone tracking',
    body: 'Move through modules in order and watch your mastery grow topic by topic.',
    tint: 'text-amber-300',
  },
];

/* ------------------------------------------------------- mock UI fragments */
const AssessmentMock = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-chalk-faint">
        Topic: Artificial Intelligence
      </span>
      <span className="rounded-full border border-brand-400/30 bg-brand-500/12 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-brand-200">
        Intermediate
      </span>
    </div>
    <p className="text-[0.95rem] font-semibold leading-snug text-chalk">
      What is the difference between supervised and unsupervised learning?
    </p>
    <div className="mt-4 space-y-2">
      {[
        'Supervised learning requires labelled training data',
        'Unsupervised learning works with unlabelled data',
        'They are the same thing',
      ].map((opt, i) => (
        <div
          key={opt}
          className={`rounded-xl px-3.5 py-2.5 text-[0.82rem] transition-colors ${
            i === 0
              ? 'border border-brand-400/40 bg-brand-500/15 text-chalk'
              : 'border border-white/8 bg-white/[0.03] text-chalk-muted'
          }`}
        >
          {opt}
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
      <span className="text-xs text-chalk-faint">Question 3 of 6</span>
      <span className="rounded-lg bg-brand-gradient px-3.5 py-1.5 text-xs font-semibold text-white">
        Next
      </span>
    </div>
  </div>
);

const CurriculumMock = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
    <div className="mb-4 flex items-center justify-between">
      <span className="text-[0.8rem] font-bold text-chalk">
        Your AI-generated curriculum
      </span>
      <span className="rounded-full border border-mint-400/30 bg-mint-400/12 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-mint-400">
        Personalised
      </span>
    </div>
    <div className="space-y-2.5">
      {[
        { t: 'Module 1: Introduction', s: 'Complete', c: 'mint' },
        { t: 'Module 2: Core Concepts', s: 'In progress', c: 'brand' },
        { t: 'Module 3: Advanced Topics', s: 'Upcoming', c: 'muted' },
      ].map((row) => (
        <div
          key={row.t}
          className={`flex items-center justify-between rounded-xl border-l-[3px] px-4 py-3 ${
            row.c === 'mint'
              ? 'border-mint-400 bg-mint-400/10'
              : row.c === 'brand'
                ? 'border-brand-400 bg-brand-500/12'
                : 'border-white/20 bg-white/[0.03]'
          }`}
        >
          <span className="text-[0.85rem] font-medium text-chalk">{row.t}</span>
          <span
            className={`text-[0.7rem] font-semibold uppercase tracking-wider ${
              row.c === 'mint'
                ? 'text-mint-400'
                : row.c === 'brand'
                  ? 'text-brand-200'
                  : 'text-chalk-faint'
            }`}
          >
            {row.s}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />

      {/* ------------------------------------------------------------- Header */}
      <section className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-32 text-center md:px-8 md:pt-40">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200 backdrop-blur-xl">
          <FaLayerGroup className="h-3.5 w-3.5" />
          Features
        </span>
        <h1
          className="animate-fade-up delay-150 mx-auto mt-7 max-w-4xl text-balance text-4xl font-extrabold leading-[1.08] text-chalk md:text-6xl"
        >
          A complete learning loop,{' '}
          <span className="text-gradient-animated">from scratch</span>
        </h1>
        <p
          className="animate-fade-up delay-300 mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-chalk-muted"
        >
          Diagnose, design, deliver and deepen. CourseCraft gives you the
          tools to go from curious to confident in a single flow.
        </p>
      </section>

      {/* ------------------------------------------------------ Core features */}
      <section className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {coreFeatures.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- Deep dive */}
      <section className="relative mx-auto w-full max-w-7xl px-5 py-28 md:px-8">
        <SectionHeader
          eyebrow="Under the hood"
          title={
            <>
              The engine behind your{' '}
              <span className="text-gradient">personalised path</span>
            </>
          }
          subtitle="Two things do the heavy lifting: an honest diagnostic and a curriculum builder that listens to it."
        />

        <div className="mt-16 space-y-6">
          {deepDive.map((d, i) => (
            <div
              key={d.title}
              className="glass relative overflow-hidden rounded-[2rem] p-7 md:p-10"
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />

              <div className="relative grid items-center gap-9 lg:grid-cols-2">
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <span className="mb-5 inline-grid h-13 w-13 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_12px_30px_-12px_rgba(139,92,246,0.9)]">
                    <d.icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-2xl font-extrabold text-chalk md:text-3xl">
                    {d.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-pretty leading-relaxed text-chalk-muted">
                    {d.body}
                  </p>
                  <ul className="mt-7 space-y-3">
                    {d.points.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint-400/15 text-mint-400">
                          <FaCircleCheck className="h-3 w-3" />
                        </span>
                        <span className="text-[0.95rem] leading-relaxed text-chalk-soft">
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  {d.mock === 'assessment' ? (
                    <AssessmentMock />
                  ) : (
                    <CurriculumMock />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- Experience */}
      <section className="relative mx-auto w-full max-w-7xl px-5 pb-28 md:px-8">
        <SectionHeader
          eyebrow="Day to day"
          title={
            <>
              An experience you will{' '}
              <span className="text-gradient">want to return to</span>
            </>
          }
          subtitle="Learning only works when the experience keeps you moving."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {experience.map((e) => (
            <div
              key={e.title}
              className="group rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span
                className={`mb-5 inline-grid h-13 w-13 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] ${e.tint} transition-transform duration-500 group-hover:scale-110`}
              >
                <e.icon className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-chalk">{e.title}</h3>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-chalk-muted">
                {e.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="ring-gradient relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-brand-gradient-soft px-8 py-16 text-center backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <span className="mb-6 inline-grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_12px_34px_-12px_rgba(139,92,246,0.95)]">
              <FaBookOpen className="h-6 w-6" />
            </span>
            <h2 className="text-balance text-4xl font-extrabold leading-tight text-chalk md:text-5xl">
              Experience personalised learning for yourself
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-chalk-soft">
              Pick a topic. Answer six questions. Walk away with a course built
              around exactly where you stand.
            </p>
            <Link to="/" className="btn-brand mt-9 px-8 py-4 text-[0.98rem]">
              Start learning now
              <FaArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

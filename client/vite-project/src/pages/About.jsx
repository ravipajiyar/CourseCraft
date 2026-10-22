import Navbar from '../components/Navbar/Navbar';
import BackgroundFX from '../components/ui/BackgroundFX';
import Footer from '../components/ui/Footer';
import SectionHeader from '../components/ui/SectionHeader';
import {
  FaLightbulb,
  FaUsers,
  FaCircleCheck,
  FaShieldHalved,
  FaBullseye,
  FaArrowRight,
  FaWandSparkles,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: FaLightbulb,
    title: 'Innovation in learning tech',
    body: 'AI should make teaching better, not replace it. Every feature is built to amplify what a great mentor would do.',
  },
  {
    icon: FaUsers,
    title: 'Open to every level',
    body: 'Beginner, intermediate or expert — the starting point adapts to you. Nobody gets left behind or bored.',
  },
  {
    icon: FaCircleCheck,
    title: 'Quality over quantity',
    body: 'A short course that actually lands beats fifty shallow ones. Every module earns its place.',
  },
  {
    icon: FaShieldHalved,
    title: 'Responsible AI',
    body: 'Your answers stay yours. We are careful about how learner data is handled and why it is used.',
  },
];

const differentiators = [
  {
    icon: FaBullseye,
    title: 'Real-time gap analysis',
    body: 'We map exactly where your understanding thins out instead of assuming everyone starts from zero.',
  },
  {
    icon: FaWandSparkles,
    title: 'AI-generated curriculum',
    body: 'Modules are assembled for your weaknesses and sequenced so each one builds on the last.',
  },
  {
    icon: FaUsers,
    title: 'Expert-informed',
    body: 'The assessment and note generation are guided by how experienced engineers actually teach.',
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />

      {/* ------------------------------------------------------------- Header */}
      <section className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-32 text-center md:px-8 md:pt-40">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200 backdrop-blur-xl">
          <FaCircleCheck className="h-3.5 w-3.5" />
          About us
        </span>
        <h1
          className="animate-fade-up delay-150 mx-auto mt-7 max-w-4xl text-balance text-4xl font-extrabold leading-[1.08] text-chalk md:text-6xl"
        >
          Education that finally{' '}
          <span className="text-gradient-animated">fits the person</span>
        </h1>
        <p
          className="animate-fade-up delay-300 mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-chalk-muted"
        >
          CourseCraft was built on a simple observation: the same course is
          wrong for almost everyone. So we made one that is right for you.
        </p>
      </section>

      {/* ------------------------------------------------------------ Mission */}
      <section className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-8 shadow-lift md:p-12">
          <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-aqua-400/15 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-200">
                Our mission
              </p>
              <h2 className="mt-4 text-balance text-3xl font-extrabold leading-tight text-chalk md:text-4xl">
                Learning paths that adapt to the learner
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-chalk-muted">
                We believe education should be tailored to each person&apos;s unique
                journey. Our mission is to make high-quality, personalised
                learning accessible to anyone with a topic and a spare hour.
              </p>
              <p className="mt-4 text-pretty leading-relaxed text-chalk-muted">
                CourseCraft helps learners of every level master new skills
                efficiently — by building custom paths that respond to your
                knowledge, your pace and your goals.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { k: '2023', l: 'Project founded' },
                { k: '3', l: 'Difficulty tiers' },
                { k: '6', l: 'Diagnostic questions' },
                { k: '1', l: 'Personalised course' },
              ].map((stat) => (
                <div
                  key={stat.l}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-400 hover:-translate-y-1 hover:border-brand-400/40 hover:bg-white/[0.07]"
                >
                  <p className="text-gradient-animated text-4xl font-extrabold">
                    {stat.k}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-chalk-faint">
                    {stat.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Values */}
      <section className="relative mx-auto w-full max-w-7xl px-5 py-28 md:px-8">
        <SectionHeader
          eyebrow="What we stand for"
          title={
            <>
              Our values, written{' '}
              <span className="text-gradient">as promises</span>
            </>
          }
          subtitle="The principles behind every assessment, every module and every note we generate."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="group flex gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-400/40 hover:bg-white/[0.06]"
            >
              <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_12px_30px_-12px_rgba(139,92,246,0.9)] transition-transform duration-500 group-hover:scale-110">
                <v.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-chalk">{v.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-chalk-muted">
                  {v.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- Our story */}
      <section className="relative mx-auto w-full max-w-7xl px-5 pb-28 md:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-[2rem] p-8 md:p-10">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-200">
              Our story
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-chalk">
              Born from a frustrating gap
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-chalk-muted">
              CourseCraft started in 2023 with educators and AI specialists who
              kept hitting the same wall: one-size-fits-all courses fail most
              learners. They are too easy for the advanced and too dense for
              the beginner.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-chalk-muted">
              So we set out to build the adaptive platform we wished existed —
              one that asks what you already know, then designs the rest around
              your answer.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-chalk-muted">
              Today, learners use CourseCraft across dozens of subjects, each
              course custom-tailored to help them reach mastery in the least
              possible time.
            </p>
          </div>

          <div className="glass rounded-[2rem] p-8 md:p-10">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-200">
              How we are different
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-chalk">
              Three ideas that drive the product
            </h2>
            <div className="mt-7 space-y-6">
              {differentiators.map((d, i) => (
                <div key={d.title} className="flex gap-4">
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-400/35 bg-brand-500/12 text-brand-200">
                    <d.icon className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-gradient font-mono text-[0.6rem] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="text-[1.05rem] font-bold text-chalk">
                      {d.title}
                    </h3>
                    <p className="mt-1.5 text-[0.95rem] leading-relaxed text-chalk-muted">
                      {d.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="ring-gradient relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-brand-gradient-soft px-8 py-16 text-center backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-4xl font-extrabold leading-tight text-chalk md:text-5xl">
              Your next course is{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-aqua-300">
                one question away
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-chalk-soft">
              See the whole system in action — take the diagnostic and watch a
              course assemble itself around your answers.
            </p>
            <Link to="/" className="btn-brand mt-9 px-8 py-4 text-[0.98rem]">
              Build my course
              <FaArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useQuestions } from '../../contexts/Questioncontext';
import { useCourse } from '../../contexts/courseContext';
import { useNavigate } from 'react-router';
import axios from 'axios';
import {
  FaArrowLeft,
  FaArrowRight,
  FaWandMagicSparkles,
  FaLightbulb,
  FaShieldHalved,
  FaCheck,
  FaBrain,
} from 'react-icons/fa6';
import AiLoader from '../ui/AiLoader';
import { API_ROUTES } from '../../config/api';

const TIERS = [
  { key: 'basic', label: 'Basic', range: [0, 2], accent: 'mint' },
  { key: 'intermediate', label: 'Intermediate', range: [2, 4], accent: 'brand' },
  { key: 'advanced', label: 'Advanced', range: [4, 6], accent: 'amber' },
];

const tierStyles = {
  mint: 'border-mint-400/30 bg-mint-400/10 text-mint-400',
  brand: 'border-brand-400/30 bg-brand-500/12 text-brand-200',
  amber: 'border-amber-300/30 bg-amber-300/10 text-amber-300',
};

const tierFor = (index) =>
  TIERS.find((t) => index >= t.range[0] && index < t.range[1]) ?? TIERS[0];

const ChatAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { questions: qsn = [], topic } = useQuestions();
  const { setCourse } = useCourse();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  const total = qsn.length;

  useEffect(() => {
    setUserAnswers(Array(total).fill(''));
    setCurrentQuestion(0);
  }, [total]);

  const progress = total ? ((currentQuestion + 1) / total) * 100 : 0;
  const tier = tierFor(currentQuestion);
  const answered = useMemo(
    () => userAnswers.filter((a) => a && a.trim().length > 0).length,
    [userAnswers]
  );

  const handleInputChange = (e) => {
    const next = [...userAnswers];
    next[currentQuestion] = e.target.value;
    setUserAnswers(next);
  };

  const handleNext = () => {
    if (currentQuestion < total - 1) setCurrentQuestion((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((p) => p - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        API_ROUTES.generateModule,
        { questions: qsn, answers: userAnswers, topic }
      );
      setCourse(response.data.course);
      navigate('/course');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Could not generate your course. Please make sure the backend and NLP services are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-6">
        <AiLoader
          label="Crafting your personalised course"
          hint="Evaluating your answers against expert expectations and ordering every module around your actual level."
        />
      </div>
    );
  }

  if (!total) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white">
          <FaBrain className="h-7 w-7" />
        </span>
        <h2 className="text-2xl font-bold text-chalk">No assessment in progress</h2>
        <p className="max-w-md text-chalk-muted">
          Start from the homepage and pick a topic — we will generate a
          personalised set of questions for you.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-brand px-7 py-3 text-sm"
        >
          Choose a topic
        </button>
      </div>
    );
  }

  const answer = userAnswers[currentQuestion] || '';

  return (
    <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-28 md:px-8">
      {/* ------------------------------------------------------------ Header */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200 backdrop-blur-xl">
          <FaBrain className="h-3.5 w-3.5" />
          Knowledge check
        </span>
        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-chalk md:text-5xl">
          Let’s find your{' '}
          <span className="text-gradient">starting point</span>
        </h1>
        <p className="mt-4 text-pretty text-lg text-chalk-muted">
          Six quick questions about{' '}
          <span className="font-semibold text-chalk">{topic || 'your topic'}</span>
          . Answer honestly — there are no wrong answers here, only your actual
          level.
        </p>
      </div>

      {/* ---------------------------------------------------------- Progress */}
      <div className="mx-auto mt-12 max-w-3xl">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em]">
          <span className="text-chalk-faint">
            Question {currentQuestion + 1} of {total}
          </span>
          <span className="text-brand-200">{answered} answered</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500 ease-spring"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          {qsn.map((_, i) => {
            const done = userAnswers[i] && userAnswers[i].trim().length > 0;
            const active = i === currentQuestion;
            return (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                aria-label={`Go to question ${i + 1}`}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-brand-400'
                    : done
                      ? 'bg-mint-400/70'
                      : 'bg-white/10 hover:bg-white/25'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------ Layout */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* question card */}
        <div className="glass-strong relative overflow-hidden rounded-3xl p-7 shadow-lift md:p-9">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${tierStyles[tier.accent]}`}
              >
                {tier.label} level
              </span>
              <span className="font-mono text-xs text-chalk-faint">
                {String(currentQuestion + 1).padStart(2, '0')} /{' '}
                {String(total).padStart(2, '0')}
              </span>
            </div>

            <h2 className="text-balance text-xl font-bold leading-snug text-chalk md:text-2xl">
              {qsn[currentQuestion]}
            </h2>

            <div className="relative mt-6">
              <textarea
                rows={7}
                value={answer}
                onChange={handleInputChange}
                placeholder="Share what you know… even a rough sketch helps the AI place you accurately."
                className="field resize-none !text-[1.02rem] !leading-relaxed"
              />
              <span className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-ink-900/80 px-2 py-0.5 text-[0.7rem] font-medium text-chalk-faint backdrop-blur">
                {answer.length} chars
              </span>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="btn-ghost px-6 py-3 text-sm"
              >
                <FaArrowLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              {currentQuestion < total - 1 ? (
                <button
                  onClick={handleNext}
                  className="btn-brand px-7 py-3 text-sm"
                >
                  Next question
                  <FaArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={answered === 0}
                  className="btn-brand px-7 py-3 text-sm"
                >
                  <FaWandMagicSparkles className="h-4 w-4" />
                  Generate my course
                </button>
              )}
            </div>
          </div>
            </div>

            {error && (
              <p className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-5 py-3.5 text-sm text-rose-200 animate-fade-up">
                {error}
              </p>
            )}

            {/* side panel */}

        <aside className="space-y-5">
          <div className="glass rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-300/15 text-amber-300">
                <FaLightbulb className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-chalk">
                Write better
              </h3>
            </div>
            <ul className="space-y-3 text-sm leading-relaxed text-chalk-muted">
              {[
                'Describe your current level honestly',
                'Name specific areas you want to cover',
                'Mention how you plan to use this skill',
                'Partial knowledge is fine — detail helps',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint-400/15 text-mint-400">
                    <FaCheck className="h-2 w-2" />
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-aqua-400/15 text-aqua-300">
                <FaShieldHalved className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-chalk">
                What happens next
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-chalk-muted">
              Your answers are compared against expert-written answers to
              estimate your level. We then generate a course that starts at your
              level and climbs from there.
            </p>
            <div className="mt-5 space-y-2.5">
              {TIERS.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-xs"
                >
                  <span className="font-medium text-chalk-soft">{t.label}</span>
                  <span className="text-chalk-faint">
                    {t.range[0] + 1}–{t.range[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChatAI;

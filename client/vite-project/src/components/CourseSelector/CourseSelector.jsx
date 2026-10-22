import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMagnifyingGlass, FaArrowRight, FaWandMagicSparkles } from 'react-icons/fa6';
import { useQuestions } from '../../contexts/Questioncontext';
import { API_ROUTES } from '../../config/api';
import AiLoader from '../ui/AiLoader';

const suggestions = [
  'Machine Learning',
  'React',
  'Python',
  'Data Structures',
  'System Design',
  'Deep Learning',
];

export default function CourseSelector() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setQuestions, setTopic } = useQuestions();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const topic = inputValue.trim();
    if (!topic || loading) return;

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        API_ROUTES.generateQuestions,
        { topic }
      );
      const res = [
        ...response.data.data.basic,
        ...response.data.data.intermediate,
        ...response.data.data.advanced,
      ];

      setQuestions(res);
      setTopic(topic);

      navigate('/genchat');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Could not reach the learning engine. Make sure the backend is running and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pick = (s) => {
    setInputValue(s);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-12 backdrop-blur-xl">
        <AiLoader
          label="Crafting your assessment"
          hint="The AI is writing questions calibrated to three difficulty levels for this topic."
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="glass-strong relative overflow-hidden rounded-3xl p-2 shadow-lift"
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-aqua-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-chalk-faint">
              <FaMagnifyingGlass className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              placeholder="What do you want to master?"
              aria-label="Topic you want to learn"
              className="w-full rounded-[1.35rem] border border-transparent bg-transparent py-5 pl-12 pr-4 text-lg font-medium text-chalk placeholder:text-chalk-faint focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="btn-brand shrink-0 px-7 py-5 text-[0.98rem] sm:rounded-[1.35rem]"
          >
            Start learning
            <FaArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-5 py-3.5 text-sm text-rose-200 animate-fade-up">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-chalk-faint">
          <FaWandMagicSparkles className="h-3 w-3 text-brand-300" />
          Try
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pick(s)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
                inputValue === s
                  ? 'border-brand-400/60 bg-brand-500/20 text-brand-100'
                  : 'border-white/10 bg-white/[0.04] text-chalk-muted hover:-translate-y-0.5 hover:border-brand-400/40 hover:text-chalk'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

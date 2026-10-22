import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import BackgroundFX from '../components/ui/BackgroundFX';
import Footer from '../components/ui/Footer';
import AiLoader from '../components/ui/AiLoader';
import {
  FaChevronDown,
  FaArrowLeft,
  FaClock,
  FaBookOpen,
  FaLaptop,
  FaCertificate,
  FaArrowRight,
  FaListUl,
  FaGraduationCap,
  FaCircleNotch,
} from 'react-icons/fa6';
import { useCourse } from '../contexts/courseContext';
import axios from 'axios';
import { marked } from 'marked';
import { useNavigate } from 'react-router';
import { API_ROUTES } from '../config/api';

/* ------------------------------------------------------------------ Module */
const CourseModule = ({ module, index, setSelectedTopic }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl transition-all duration-400 hover:border-white/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-5 text-left md:px-6"
      >
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold transition-all duration-300 ${
            open
              ? 'bg-brand-gradient text-white shadow-[0_8px_24px_-10px_rgba(139,92,246,0.9)]'
              : 'border border-white/12 bg-white/[0.05] text-chalk-muted group-hover:border-brand-400/40 group-hover:text-chalk'
          }`}
        >
          {String(module.moduleNumber ?? index + 1).padStart(2, '0')}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-brand-200">
            Module {module.moduleNumber ?? index + 1}
          </span>
          <span className="mt-1 block truncate text-lg font-bold text-chalk">
            {module.moduleName}
          </span>
        </span>

        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-chalk-muted sm:flex">
          <FaListUl className="h-3 w-3" />
          {module.contents?.length ?? 0} topics
        </span>

        <FaChevronDown
          className={`h-4 w-4 shrink-0 text-chalk-faint transition-transform duration-400 ${
            open ? 'rotate-180 text-brand-200' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-400 ease-spring ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-white/8 px-4 py-4 md:px-5">
            {module.contents?.map((content, i) => (
              <button
                key={i}
                onClick={() => setSelectedTopic(content)}
                className="group/topic flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-300 hover:bg-brand-500/12"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] font-mono text-[0.65rem] font-bold text-chalk-muted transition-colors duration-300 group-hover/topic:border-brand-400/50 group-hover/topic:text-brand-200">
                  {i + 1}
                </span>
                <span className="flex-1 text-[0.95rem] font-medium leading-snug text-chalk-soft transition-colors duration-300 group-hover/topic:text-chalk">
                  {content}
                </span>
                <FaArrowRight className="h-3.5 w-3.5 shrink-0 text-chalk-faint opacity-0 transition-all duration-300 group-hover/topic:translate-x-0.5 group-hover/topic:text-brand-200 group-hover/topic:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- Intro card */
const CourseIntroCard = ({ course, navigate }) => {
  const modules = course.modules || [];
  const totalTopics = modules.reduce((acc, m) => acc + (m.contents?.length ?? 0), 0);

  const meta = [
    { icon: FaClock, label: 'Duration', value: `${modules.length} module${modules.length === 1 ? '' : 's'}`, tint: 'text-brand-200' },
    { icon: FaBookOpen, label: 'Coverage', value: `${totalTopics} topics`, tint: 'text-aqua-300' },
    { icon: FaLaptop, label: 'Format', value: 'Interactive lessons', tint: 'text-amber-300' },
    { icon: FaCertificate, label: 'Outcome', value: 'Course certificate', tint: 'text-mint-400' },
  ];

  return (
    <div className="glass-strong relative overflow-hidden rounded-3xl p-7 shadow-lift md:p-9">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-aqua-400/15 blur-3xl" />

      <div className="relative grid gap-9 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/25 bg-mint-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-mint-400">
            <FaGraduationCap className="h-3.5 w-3.5" />
            Personalised for you
          </span>

          <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-chalk md:text-4xl">
            {course.title}
          </h2>

          <p className="mt-5 max-w-xl text-pretty leading-relaxed text-chalk-muted">
            This curriculum was assembled from your assessment answers. It
            starts at your current level and climbs from there — open any topic
            to read the detailed notes.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {meta.map(({ icon: Icon, label, value, tint }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur-md transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <Icon className={`mb-2 h-4 w-4 ${tint}`} />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-chalk-faint">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-chalk">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-brand-gradient-soft p-8 text-center backdrop-blur-xl">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_12px_34px_-12px_rgba(139,92,246,0.95)]">
            <FaArrowRight className="h-6 w-6" />
          </span>
          <h3 className="text-2xl font-extrabold text-chalk">Ready to begin?</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-chalk-soft">
            Open the course player to work through every module with
            AI-generated notes.
          </p>
          <button
            onClick={() => navigate('/coursecontent')}
            className="btn-brand mt-7 w-full px-7 py-3.5 text-sm"
          >
            Enter course player
          </button>
          <p className="mt-4 text-xs text-chalk-faint">
            Progress is saved to your account
          </p>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------- Notes */
const Notes = ({ topic, setSelectedTopic }) => {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.post(
          API_ROUTES.getNotes,
          { topic }
        );
        if (!cancelled) setNotes(response.data.notes.note);
      } catch (err) {
        if (!cancelled)
          setError(
            err?.response?.data?.message ||
              'Could not load notes for this topic. Please try again.'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchNotes();
    return () => {
      cancelled = true;
    };
  }, [topic]);

  if (loading) {
    return (
      <div className="glass flex min-h-[24rem] items-center justify-center rounded-3xl">
        <AiLoader
          label="Writing your notes"
          hint="The AI is expanding this topic into a structured study guide."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-10 text-center">
        <p className="mx-auto mb-5 max-w-md text-rose-200">{error}</p>
        <button
          onClick={() => setSelectedTopic(null)}
          className="btn-ghost px-6 py-3 text-sm"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          Back to course
        </button>
      </div>
    );
  }

  return (
    <div className="glass-strong relative overflow-hidden rounded-3xl shadow-lift">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent" />

      <div className="relative flex flex-col gap-4 border-b border-white/10 px-7 py-6 md:flex-row md:items-center md:justify-between md:px-9">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-brand-200">
            Topic notes
          </p>
          <h2 className="mt-1.5 text-balance text-2xl font-extrabold leading-snug text-chalk md:text-3xl">
            {topic}
          </h2>
        </div>
        <button
          onClick={() => setSelectedTopic(null)}
          className="btn-ghost shrink-0 px-5 py-2.5 text-sm"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          Back to course
        </button>
      </div>

      <div
        className="markdown-body px-7 py-8 md:px-9 md:py-10"
        dangerouslySetInnerHTML={{ __html: marked.parse(notes || '') }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------- Page */
const CoursePage = () => {
  const { course } = useCourse();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  if (!course) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <BackgroundFX />
        <Navbar />
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_14px_40px_-14px_rgba(139,92,246,0.95)]">
          <FaCircleNotch className="h-7 w-7 animate-spin" />
        </span>
        <h2 className="mt-6 text-2xl font-bold text-chalk">
          No course to display yet
        </h2>
        <p className="mt-2.5 max-w-md text-chalk-muted">
          Generate a course first — pick a topic and answer the quick
          knowledge check.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-brand mt-8 px-7 py-3.5 text-sm"
        >
          Create a course
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-32 md:px-8 md:pt-36">
        {/* heading */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200 backdrop-blur-xl">
            <FaGraduationCap className="h-3.5 w-3.5" />
            Your curriculum
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-chalk md:text-5xl">
            Explore your{' '}
            <span className="text-gradient">personalised course</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-chalk-muted">
            Every module below was chosen because it is the next thing you
            need — not because it was next on a generic list.
          </p>
        </div>

        <div className="space-y-6">
          {!selectedTopic ? (
            <>
              <CourseIntroCard course={course} navigate={navigate} />

              <div className="flex items-center gap-4 px-1 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-chalk-faint">
                  Course modules
                </h3>
                <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-chalk-muted">
                  {course.modules?.length ?? 0}
                </span>
              </div>

              <div className="space-y-3">
                {course.modules?.map((module, index) => (
                  <CourseModule
                    key={module.moduleNumber ?? index}
                    module={module}
                    index={index}
                    setSelectedTopic={setSelectedTopic}
                  />
                ))}
              </div>
            </>
          ) : (
            <Notes topic={selectedTopic} setSelectedTopic={setSelectedTopic} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursePage;

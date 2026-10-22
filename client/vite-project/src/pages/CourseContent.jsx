import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import BackgroundFX from '../components/ui/BackgroundFX';
import Footer from '../components/ui/Footer';
import AiLoader from '../components/ui/AiLoader';
import {
  FaChevronDown,
  FaArrowLeft,
  FaGraduationCap,
  FaCircleNotch,
  FaBookOpen,
} from 'react-icons/fa6';
import { useCourse } from '../contexts/courseContext';
import { useNavigate } from 'react-router';
import { marked } from 'marked';
import { API_ROUTES, apiPost } from '../config/api';

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
        const response = await apiPost(
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
      <div className="glass flex min-h-[18rem] items-center justify-center rounded-3xl">
        <AiLoader
          label="Writing your notes"
          hint="Expanding this topic into a structured study guide."
          size="sm"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <p className="mx-auto mb-4 max-w-md text-rose-200">{error}</p>
        <button
          onClick={() => setSelectedTopic(null)}
          className="btn-ghost px-5 py-2.5 text-sm"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          Close notes
        </button>
      </div>
    );
  }

  return (
    <div className="glass-strong relative mt-4 overflow-hidden rounded-3xl shadow-lift animate-fade-up">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent" />
      <div
        className="markdown-body px-6 py-8 md:px-8"
        dangerouslySetInnerHTML={{ __html: marked.parse(notes || '') }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------- Page */
const CourseContent = () => {
  const [activeModule, setActiveModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const { course } = useCourse();
  const navigate = useNavigate();

  const modules = course?.modules ?? [];

  const toggleModule = (moduleNumber) => {
    setActiveModule((prev) => (prev === moduleNumber ? null : moduleNumber));
    setSelectedTopic(null);
  };

  useEffect(() => {
    if (modules.length && activeModule === null) {
      setActiveModule(modules[0].moduleNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules.length]);

  if (!course) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <BackgroundFX />
        <Navbar />
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_14px_40px_-14px_rgba(139,92,246,0.95)]">
          <FaCircleNotch className="h-7 w-7 animate-spin" />
        </span>
        <h2 className="mt-6 text-2xl font-bold text-chalk">
          No course loaded yet
        </h2>
        <p className="mt-2.5 max-w-md text-chalk-muted">
          Generate a course first, then open the player to work through the
          modules.
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

  const active = modules.find((m) => m.moduleNumber === activeModule);

  return (
    <div className="relative min-h-screen">
      <BackgroundFX variant="compact" />
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-28 md:px-8 md:pt-32">
        {/* course header */}
        <div className="glass-strong relative mb-8 overflow-hidden rounded-3xl p-7 shadow-lift md:p-9">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/25 bg-mint-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-mint-400">
              <FaGraduationCap className="h-3.5 w-3.5" />
              Course player
            </span>
            <h1 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-chalk md:text-4xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-3xl text-pretty leading-relaxed text-chalk-muted">
              Work through each module in order. Tap any topic to generate
              detailed, AI-written notes tailored to what you are working on
              right now.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-chalk-soft">
                <FaBookOpen className="h-3 w-3 text-brand-200" />
                {modules.length} modules
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-chalk-soft">
                <FaBookOpen className="h-3 w-3 text-aqua-300" />
                {modules.reduce((a, m) => a + (m.contents?.length ?? 0), 0)} topics
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          {/* sidebar */}
          <aside className="lg:sticky lg:top-28 lg:h-[calc(100vh-9rem)]">
            <div className="glass flex h-full flex-col rounded-3xl p-4">
              <p className="px-3 pb-3 pt-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-chalk-faint">
                Curriculum
              </p>
              <div className="nice-scroll flex-1 space-y-2 overflow-y-auto pr-1">
                {modules.map((module, index) => {
                  const isActive = activeModule === module.moduleNumber;
                  return (
                    <div
                      key={module.moduleNumber ?? index}
                      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                        isActive
                          ? 'border-brand-400/45 bg-brand-500/12'
                          : 'border-white/8 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06]'
                      }`}
                    >
                      <button
                        onClick={() => toggleModule(module.moduleNumber)}
                        className="flex w-full items-center gap-3 p-4 text-left"
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold transition-all duration-300 ${
                            isActive
                              ? 'bg-brand-gradient text-white'
                              : 'border border-white/12 bg-white/[0.05] text-chalk-muted'
                          }`}
                        >
                          {String(module.moduleNumber ?? index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-sm font-semibold ${
                              isActive ? 'text-chalk' : 'text-chalk-soft'
                            }`}
                          >
                            {module.moduleName}
                          </span>
                          <span className="mt-0.5 block text-[0.7rem] text-chalk-faint">
                            {module.contents?.length ?? 0} topics
                          </span>
                        </span>
                        <FaChevronDown
                          className={`h-3.5 w-3.5 shrink-0 text-chalk-faint transition-transform duration-300 ${
                            isActive ? 'rotate-180 text-brand-200' : ''
                          }`}
                        />
                      </button>

                      <div
                        className={`grid transition-all duration-400 ease-spring ${
                          isActive
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="space-y-1 px-3 pb-3">
                            {module.contents?.map((content, i) => {
                              const isSelected = selectedTopic === content;
                              return (
                                <button
                                  key={i}
                                  onClick={() =>
                                    setSelectedTopic(
                                      isSelected ? null : content
                                    )
                                  }
                                  className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.85rem] leading-snug transition-all duration-200 ${
                                    isSelected
                                      ? 'bg-brand-500/25 font-semibold text-chalk'
                                      : 'text-chalk-muted hover:bg-white/[0.06] hover:text-chalk'
                                  }`}
                                >
                                  <span
                                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                                      isSelected
                                        ? 'bg-aqua-400'
                                        : 'bg-white/20'
                                    }`}
                                  />
                                  {content}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* content */}
          <section className="min-w-0">
            {active ? (
              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-brand-200">
                      Module {active.moduleNumber}
                    </p>
                    <h2 className="mt-1.5 text-2xl font-extrabold text-chalk">
                      {active.moduleName}
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-chalk-muted">
                    {active.contents?.length ?? 0} topics
                  </span>
                </div>

                <div className="space-y-2">
                  {active.contents?.map((content, i) => {
                    const isSelected = selectedTopic === content;
                    return (
                      <div key={i}>
                        <button
                          onClick={() =>
                            setSelectedTopic(isSelected ? null : content)
                          }
                          className={`group flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                            isSelected
                              ? 'border-brand-400/50 bg-brand-500/12'
                              : 'border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold transition-colors duration-300 ${
                              isSelected
                                ? 'bg-brand-gradient text-white'
                                : 'border border-white/12 bg-white/[0.05] text-chalk-muted group-hover:border-brand-400/40 group-hover:text-brand-200'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span
                            className={`flex-1 text-[0.95rem] font-medium leading-snug ${
                              isSelected ? 'text-chalk' : 'text-chalk-soft'
                            }`}
                          >
                            {content}
                          </span>
                          <FaChevronDown
                            className={`h-3.5 w-3.5 shrink-0 text-chalk-faint transition-transform duration-300 ${
                              isSelected ? 'rotate-180 text-brand-200' : ''
                            }`}
                          />
                        </button>

                        {isSelected && (
                          <Notes
                            topic={selectedTopic}
                            setSelectedTopic={setSelectedTopic}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass rounded-3xl p-10 text-center">
                <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_12px_34px_-12px_rgba(139,92,246,0.95)]">
                  <FaGraduationCap className="h-6 w-6" />
                </span>
                <h3 className="text-2xl font-bold text-chalk">
                  Select a module to begin
                </h3>
                <p className="mx-auto mt-2.5 max-w-sm text-chalk-muted">
                  Pick a module from the curriculum on the left and explore its
                  topics at your own pace.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseContent;

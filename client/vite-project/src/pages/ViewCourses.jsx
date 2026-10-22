import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import BackgroundFX from '../components/ui/BackgroundFX';
import Footer from '../components/ui/Footer';
import SectionHeader from '../components/ui/SectionHeader';
import { useCourse } from '../contexts/courseContext';
import {
  FaGraduationCap,
  FaArrowRight,
  FaBookOpen,
  FaListUl,
  FaPlus,
  FaClock,
} from 'react-icons/fa6';

const seedCourses = [
  {
    id: 'seed-1',
    title: 'Introduction to AI',
    modules: 4,
    topics: 18,
    level: 'Basic',
    tint: 'from-brand-500/35 to-iris-500/25',
  },
  {
    id: 'seed-2',
    title: 'Machine Learning Fundamentals',
    modules: 6,
    topics: 24,
    level: 'Intermediate',
    tint: 'from-aqua-400/30 to-brand-500/30',
  },
  {
    id: 'seed-3',
    title: 'Deep Learning Concepts',
    modules: 5,
    topics: 21,
    level: 'Advanced',
    tint: 'from-amber-300/25 to-rose-400/25',
  },
];

const CourseCard = ({ course, isLive, onOpen }) => (
  <article
    onClick={onOpen}
    className={`group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-400/40 hover:bg-white/[0.06] ${
      isLive ? 'ring-1 ring-brand-400/30' : ''
    }`}
  >
    <div
      className={`relative flex h-36 items-end bg-gradient-to-br ${course.tint} p-5`}
    >
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
      <span className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/10 text-xl font-extrabold text-white backdrop-blur-md">
        {course.title.charAt(0).toUpperCase()}
      </span>
      {isLive && (
        <span className="absolute right-4 top-4 rounded-full border border-mint-400/30 bg-mint-400/15 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-mint-400 backdrop-blur-md">
          Generated now
        </span>
      )}
    </div>

    <div className="flex flex-1 flex-col p-6">
      <h3 className="text-lg font-bold leading-snug text-chalk transition-colors duration-300 group-hover:text-brand-100">
        {course.title}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.7rem] font-medium text-chalk-muted">
          <FaListUl className="h-2.5 w-2.5" />
          {course.modules} modules
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.7rem] font-medium text-chalk-muted">
          <FaBookOpen className="h-2.5 w-2.5" />
          {course.topics} topics
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/25 bg-brand-500/12 px-2.5 py-1 text-[0.7rem] font-semibold text-brand-200">
          {course.level}
        </span>
      </div>

      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-200 opacity-0 transition-all duration-500 group-hover:opacity-100">
        Open course <FaArrowRight className="h-3 w-3" />
      </span>
    </div>
  </article>
);

export default function ViewCoursesPage() {
  const navigate = useNavigate();
  const { course } = useCourse();

  const liveCourse = course
    ? {
        id: 'live',
        title: course.title,
        modules: course.modules?.length ?? 0,
        topics: (course.modules ?? []).reduce(
          (a, m) => a + (m.contents?.length ?? 0),
          0
        ),
        level: 'Personalised',
        tint: 'from-brand-500/40 to-aqua-400/25',
      }
    : null;

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-32 md:px-8 md:pt-36">
        <SectionHeader
          eyebrow="Library"
          title={
            <>
              Your learning{' '}
              <span className="text-gradient-animated">library</span>
            </>
          }
          subtitle="Every course you have generated, plus a few starting points while you are between topics."
        />

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="btn-brand px-7 py-3.5 text-sm"
          >
            <FaPlus className="h-3.5 w-3.5" />
            Generate a new course
          </button>
        </div>

        {/* generated course */}
        {liveCourse && (
          <section className="mt-16">
            <div className="mb-5 flex items-center gap-4 px-1">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-chalk-faint">
                Your latest course
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <CourseCard
                course={liveCourse}
                isLive
                onOpen={() => navigate('/course')}
              />
            </div>
          </section>
        )}

        {/* sample library */}
        <section className="mt-16">
          <div className="mb-5 flex items-center gap-4 px-1">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-chalk-faint">
              Sample courses
            </h2>
            <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
            <span className="inline-flex items-center gap-1.5 text-xs text-chalk-faint">
              <FaClock className="h-3 w-3" />
              Curated starter paths
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {seedCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onOpen={() => navigate('/')}
              />
            ))}
          </div>
        </section>

        {!liveCourse && (
          <div className="glass mt-16 rounded-3xl p-10 text-center">
            <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-[0_14px_40px_-14px_rgba(139,92,246,0.95)]">
              <FaGraduationCap className="h-7 w-7" />
            </span>
            <h3 className="text-2xl font-bold text-chalk">
              You have not generated a course yet
            </h3>
            <p className="mx-auto mt-2.5 max-w-md text-chalk-muted">
              Pick any topic and answer six quick questions — your personalised
              course will appear right here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-brand mt-8 px-7 py-3.5 text-sm"
            >
              Create my first course
              <FaArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

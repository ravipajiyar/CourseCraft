import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import BackgroundFX from '../components/ui/BackgroundFX';
import { FaArrowLeft, FaCompass } from 'react-icons/fa6';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />
      <Navbar />

      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        <span className="animate-fade-up relative grid h-20 w-20 place-items-center rounded-3xl bg-brand-gradient text-white shadow-[0_16px_50px_-16px_rgba(139,92,246,0.95)]">
          <FaCompass className="h-9 w-9" />
        </span>

        <p className="animate-fade-up delay-150 mt-9 font-mono text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-iris-300 to-aqua-300">
          404
        </p>

        <h1 className="animate-fade-up delay-300 mt-4 text-balance text-3xl font-extrabold text-chalk md:text-4xl">
          This page took a different learning path
        </h1>

        <p
          className="animate-fade-up delay-500 mt-4 max-w-md text-pretty text-lg text-chalk-muted"
        >
          The route you followed does not exist. Head back and pick up where
          you left off.
        </p>

        <div className="animate-fade-up delay-700 mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="btn-brand px-7 py-3.5 text-sm"
          >
            <FaArrowLeft className="h-3.5 w-3.5" />
            Back home
          </button>
          <button
            onClick={() => navigate('/courselist')}
            className="btn-ghost px-7 py-3.5 text-sm"
          >
            My courses
          </button>
        </div>
      </main>
    </div>
  );
}

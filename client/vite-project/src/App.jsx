import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/landingPage';
import CoursePage from './pages/CoursePage';
import GenChatPage from './pages/GenChat';
import ViewCoursesPage from './pages/ViewCourses';
import CourseContent from './pages/CourseContent';
import { UserProvider } from './contexts/Usercontext';
import { QuestionsProvider } from './contexts/Questioncontext';
import { CourseProvider } from './contexts/courseContext';
import AboutPage from './pages/About';
import FeaturesPage from './pages/Features';
import NotFoundPage from './pages/NotFound';
import ScrollToTop from './components/ui/ScrollToTop';

function App() {
  return (
    <div className="relative min-h-screen bg-ink-950 text-chalk">
      <UserProvider>
        <QuestionsProvider>
          <CourseProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/course" element={<CoursePage />} />
                <Route path="/genchat" element={<GenChatPage />} />
                <Route path="/courselist" element={<ViewCoursesPage />} />
                <Route path="/coursecontent" element={<CourseContent />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </CourseProvider>
        </QuestionsProvider>
      </UserProvider>
    </div>
  );
}
export default App;

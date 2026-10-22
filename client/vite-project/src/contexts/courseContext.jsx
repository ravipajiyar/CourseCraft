import { createContext, useContext, useEffect, useState } from 'react';

const CourseContext = createContext();

const STORAGE_KEY = 'cc:course';

const readStoredCourse = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const CourseProvider = ({ children }) => {
  // Restoring from sessionStorage keeps the course alive across a refresh,
  // so /course and /coursecontent still work when re-opened directly.
  const [course, setCourseState] = useState(readStoredCourse);

  const setCourse = (value) => {
    setCourseState(value);
    try {
      if (value) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (private mode / quota) — keep working in memory.
    }
  };

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setCourseState(readStoredCourse());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <CourseContext.Provider value={{ course, setCourse }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = function () {
  const state = useContext(CourseContext);
  if (!state) {
    throw new Error('Used Outside the Context');
  } else {
    return state;
  }
};

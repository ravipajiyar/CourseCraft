import { createContext, useContext, useEffect, useState } from 'react';

const QuestionsContext = createContext();

const STORAGE_KEY = 'cc:questions';

const readStored = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { questions: undefined, topic: '' };
    const parsed = JSON.parse(raw);
    return {
      questions: Array.isArray(parsed.questions) ? parsed.questions : undefined,
      topic: parsed.topic || '',
    };
  } catch {
    return { questions: undefined, topic: '' };
  }
};

// Provide the context to the rest of the app
export const QuestionsProvider = ({ children }) => {
  const [{ questions, topic }, setState] = useState(readStored);

  const setQuestions = (value) =>
    setState((prev) => {
      const next = { ...prev, questions: value };
      persist(next);
      return next;
    });

  const setTopic = (value) =>
    setState((prev) => {
      const next = { ...prev, topic: value };
      persist(next);
      return next;
    });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setState(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <QuestionsContext.Provider
      value={{ questions, setQuestions, topic, setTopic }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

function persist(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — the assessment still works for this session.
  }
}

export const useQuestions = function () {
  const state = useContext(QuestionsContext);
  if (!state) {
    throw new Error('Used Outside the Context');
  } else {
    return state;
  }
};

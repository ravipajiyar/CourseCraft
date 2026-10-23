import { createContext, useContext, useEffect, useState } from 'react';
import { API_ROUTES, apiGet } from '../config/api';

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = (user) => {
    setUser(user);
    setError('');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  async function getUser() {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await apiGet(API_ROUTES.userByToken(token));
      setUser(res.data?.data?.user ?? res.data?.user ?? null);
    } catch {
      // A stale or invalid token should not break the app — drop it.
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, isLoading, error, login, logout, getUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('cannot use user context outside');
  return context;
}

export { UserProvider, useUser };

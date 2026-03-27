import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/index';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const token = localStorage.getItem('accessToken');
  //   const savedUser = localStorage.getItem('user');
  //   if (token && savedUser) {
  //     setUser(JSON.parse(savedUser));s
  //   }
  //   setIsLoading(false);
  // }, []);

  useEffect(() => {
  try {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
    }
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  } finally {
    setIsLoading(false);
  }
}, []);


  const login = (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
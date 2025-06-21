import useAuth from '@/hooks/useAuth';
import { createContext, ReactNode } from 'react';

interface AuthContextType {
  user: { id: string; username: string; cnp: string } | null;
  loading: boolean;
  login: (cnp: string) => Promise<void>;
  register: (username: string, cnp: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}; 
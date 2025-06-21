import { login as loginApi, register as registerApi } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  cnp: string;
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (cnp: string) => {
    setLoading(true);
    try {
      const userData = await loginApi(cnp);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, cnp: string) => {
    setLoading(true);
    try {
      await registerApi(username, cnp);
      toast.success('Registered successfully! Please log in.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Logged out.');
  }, []);

  return { user, loading, login, register, logout };
};

export default useAuth; 
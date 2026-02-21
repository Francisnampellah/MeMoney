import { useState, useCallback } from 'react';
import { authService, User } from './authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const register = useCallback(
    async (fullName: string, email: string, phone: string, password: string) => {
      setLoading(true);
      setError('');
      try {
        const newUser = await authService.register(fullName, email, phone, password);
        // Don't set user yet - let them login after registration
        return newUser;
      } catch (err: any) {
        const errorMessage = err.message || 'Registration failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (emailOrPhone: string, password: string) => {
      setLoading(true);
      setError('');
      try {
        const loggedInUser = await authService.login(emailOrPhone, password);
        setUser(loggedInUser);
        return loggedInUser;
      } catch (err: any) {
        const errorMessage = err.message || 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err: any) {
      console.error('Error checking current user:', err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) {
        throw new Error('No user logged in');
      }
      setLoading(true);
      setError('');
      try {
        const updatedUser = await authService.updateUser(user.id, updates as any);
        setUser(updatedUser);
        return updatedUser;
      } catch (err: any) {
        const errorMessage = err.message || 'Update failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    checkCurrentUser,
    updateProfile,
    setError,
  };
}

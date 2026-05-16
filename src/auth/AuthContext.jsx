import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { confirmPasswordReset } from '../api/auth.js';
import { apiRequest } from '../api/client.js';
import { updateMe } from '../api/user.js';
import i18n from '../i18n/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    apiRequest('/api/me')
      .then((data) => {
        if (isActive) setUser(data.user);
      })
      .catch(() => {
        if (isActive) setUser(null);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (user?.locale && i18n.language !== user.locale) {
      i18n.changeLanguage(user.locale);
    }
  }, [user?.locale]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      async login(credentials) {
        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        setUser(data.user);
        return data.user;
      },
      async register(details) {
        const data = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(details),
        });
        setUser(data.user);
        return data.user;
      },
      async logout() {
        await apiRequest('/api/auth/logout', { method: 'POST' });
        setUser(null);
      },
      async resetPassword(details) {
        const data = await confirmPasswordReset(details);
        setUser(data.user);
        return data.user;
      },
      async updateProfile(details) {
        const updatedUser = await updateMe(details);
        setUser(updatedUser);
        return updatedUser;
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

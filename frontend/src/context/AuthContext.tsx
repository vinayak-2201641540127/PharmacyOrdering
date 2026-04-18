import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { login as loginRequest, register as registerRequest, type LoginPayload, type RegisterPayload } from '../api/authApi';
import { setApiToken } from '../api/apiClient';
import type { AuthResponse, UserSummaryResponse } from '../types/api';

interface AuthContextValue {
  accessToken: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<void>;
  user: UserSummaryResponse | null;
}

interface StoredSession {
  accessToken: string;
  user: UserSummaryResponse;
}

const STORAGE_KEY = 'pharmacy-ordering-session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const loadSession = (): StoredSession | null => {
  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<StoredSession | null>(() => loadSession());

  useEffect(() => {
    setApiToken(session?.accessToken ?? null);

    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const persistSession = (response: AuthResponse) => {
    setSession({
      accessToken: response.accessToken,
      user: response.user,
    });
  };

  const value: AuthContextValue = {
    accessToken: session?.accessToken ?? null,
    isAdmin: session?.user.role === 'ADMIN',
    isAuthenticated: Boolean(session?.accessToken),
    login: async (payload) => {
      const response = await loginRequest(payload);
      persistSession(response);
    },
    logout: () => setSession(null),
    register: async (payload) => {
      const response = await registerRequest(payload);
      persistSession(response);
    },
    user: session?.user ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

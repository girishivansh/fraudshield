"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  apiMe,
  apiLogin,
  apiRegister,
  apiLogout,
  apiHistory,
  type ClientUser,
  type ClientAnalysis,
  type ClientReport,
} from "@/lib/client-api";
import { AuthModal } from "@/components/auth/auth-modal";

/* ============================================================
   Real auth + session store, backed by the /api/auth/* routes
   (httpOnly cookie JWT). On mount we ask the server who we are,
   then load the user's analyses + saved reports from the API.
   - requireAuth() gates any action behind the sign-in modal and
     resumes the *exact* action the user started after login.
   ============================================================ */

export type SessionUser = ClientUser;

type AuthContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  analyses: ClientAnalysis[];
  reports: ClientReport[];
  authOpen: boolean;
  intentLabel: string | null;
  /** Run `action` now if signed in, otherwise open the modal and resume after login. Returns true if it ran immediately. */
  requireAuth: (action: () => void, intentLabel?: string) => boolean;
  openAuth: (intentLabel?: string) => void;
  closeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; company?: string }) => Promise<void>;
  logout: () => Promise<void>;
  addAnalysis: (a: ClientAnalysis) => void;
  addReport: (r: ClientReport) => void;
  /** Reload the user + history from the server. */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [analyses, setAnalyses] = useState<ClientAnalysis[]>([]);
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [intentLabel, setIntentLabel] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const pending = useRef<(() => void) | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const { analyses, reports } = await apiHistory();
      setAnalyses(analyses);
      setReports(reports);
    } catch {
      setAnalyses([]);
      setReports([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { user } = await apiMe();
      setUser(user);
      if (user) await loadHistory();
      else {
        setAnalyses([]);
        setReports([]);
      }
    } catch {
      setUser(null);
    }
  }, [loadHistory]);

  // Ask the server who we are on first mount.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { user } = await apiMe();
        if (!alive) return;
        setUser(user);
        if (user) await loadHistory();
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadHistory]);

  const openAuth = useCallback((label?: string) => {
    setIntentLabel(label ?? null);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    pending.current = null;
    setIntentLabel(null);
  }, []);

  const requireAuth = useCallback(
    (action: () => void, label?: string) => {
      if (user) {
        action();
        return true;
      }
      pending.current = action;
      setIntentLabel(label ?? null);
      setAuthOpen(true);
      return false;
    },
    [user]
  );

  // Shared post-auth settle: adopt the user, load history, resume the pending action.
  const onAuthed = useCallback(
    async (nextUser: SessionUser) => {
      setUser(nextUser);
      setAuthOpen(false);
      setIntentLabel(null);
      await loadHistory();
      const resume = pending.current;
      pending.current = null;
      if (resume) setTimeout(resume, 60);
    },
    [loadHistory]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { user } = await apiLogin(email, password);
      await onAuthed(user);
    },
    [onAuthed]
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; company?: string }) => {
      const { user } = await apiRegister(payload);
      await onAuthed(user);
    },
    [onAuthed]
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* clear locally regardless */
    }
    setUser(null);
    setAnalyses([]);
    setReports([]);
  }, []);

  const addAnalysis = useCallback((a: ClientAnalysis) => {
    setAnalyses((prev) => [a, ...prev.filter((p) => p.id !== a.id)].slice(0, 100));
  }, []);

  const addReport = useCallback((r: ClientReport) => {
    setReports((prev) => [r, ...prev.filter((p) => p.id !== r.id)].slice(0, 100));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        hydrated,
        analyses,
        reports,
        authOpen,
        intentLabel,
        requireAuth,
        openAuth,
        closeAuth,
        login,
        register,
        logout,
        addAnalysis,
        addReport,
        refresh,
      }}
    >
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

import type { Session, User } from "@supabase/supabase-js";
import type { PropsWithChildren } from "react";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import type { AuthContextValue } from "@/features/auth/types";
import { signOutUser } from "@/features/auth/api/auth-client";
import { PASSWORD_RECOVERY_STORAGE_KEY } from "@/features/auth/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setLoading(false);
      return;
    }

    const { data } = await client.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      setLoading(false);
      return;
    }

    void refreshSession();

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        window.localStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, "active");
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(session?.user),
      isConfigured: isSupabaseConfigured,
      refreshSession,
      signOut: async () => {
        await signOutUser();
        setSession(null);
        setUser(null);
      }
    }),
    [loading, refreshSession, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

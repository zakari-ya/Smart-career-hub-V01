import type { Session, User } from "@supabase/supabase-js";

export type AuthMode = "password" | "magic";

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

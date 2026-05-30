import { Bell } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function DashboardHeader() {
  const { isConfigured, user, signOut } = useAuth();

  const displayName =
    typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.length > 0
      ? user.user_metadata.full_name
      : user?.email?.split("@")[0] ?? "Workspace member";

  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="sticky top-0 z-30 flex flex-col gap-4 border-b border-black/6 bg-[rgba(255,255,255,0.78)] px-4 py-3 backdrop-blur-xl sm:px-5 lg:px-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-graphite-700)]">Workspace</p>
          <h1 className="font-[var(--font-heading)] text-2xl font-semibold tracking-tight text-[var(--color-graphite-950)]">
            Analytics command center
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="hidden sm:inline-flex">{isConfigured ? "Secure workspace" : "Backend pending"}</Badge>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white text-[var(--color-graphite-700)]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-3 rounded-full border border-black/6 bg-white px-3 py-2 sm:flex">
            <Avatar>
              <AvatarFallback>{initials || "SC"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-[var(--color-graphite-950)]">{displayName}</p>
              <p className="text-xs text-[var(--color-graphite-700)]">{user?.email ?? "Authenticated user"}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void signOut()} className="hidden sm:inline-flex">
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

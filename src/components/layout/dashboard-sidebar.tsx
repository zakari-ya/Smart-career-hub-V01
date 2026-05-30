import { BarChart3, FileText, Home, Settings2, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  Overview: Home,
  Upload: FileText,
  Result: BarChart3,
  Settings: Settings2
} as const;

export function DashboardSidebar() {
  const { user } = useAuth();
  const displayName =
    typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.length > 0
      ? user.user_metadata.full_name
      : user?.email?.split("@")[0] ?? "Member";
  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <aside className="group/sidebar fixed inset-y-0 left-0 z-40 hidden w-[5.5rem] overflow-hidden border-r border-black/6 bg-white/72 px-3 py-4 shadow-[18px_0_60px_rgba(15,23,32,0.06)] backdrop-blur-2xl transition-[width] duration-300 ease-out hover:w-72 focus-within:w-72 lg:flex lg:flex-col">
      <Link
        to="/"
        className="flex min-h-14 items-center gap-3 rounded-[22px] px-2 text-[var(--color-graphite-950)] outline-none transition-colors hover:bg-white focus-visible:bg-white"
        aria-label="Go to landing page"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-graphite-950)] text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">
          <p className="truncate font-[var(--font-heading)] text-base font-semibold">Smart Career Hub</p>
          <p className="truncate text-xs font-medium text-[var(--color-graphite-700)]">Back to landing</p>
        </div>
      </Link>

      <nav className="mt-7 grid gap-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.label];

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "flex min-h-12 items-center gap-3 rounded-[20px] px-3 py-3 text-sm font-semibold outline-none motion-safe-transition focus-visible:ring-2 focus-visible:ring-[var(--color-teal-500)]",
                  isActive
                    ? " text-white "
                    : "text-[var(--color-graphite-700)] hover:bg-white hover:text-[var(--color-graphite-950)]"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="min-w-0 truncate opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[24px] border border-black/6 bg-white/64 p-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback>{initials || "SC"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">
            <p className="truncate text-sm font-semibold text-[var(--color-graphite-950)]">{displayName}</p>
            <p className="truncate text-xs text-[var(--color-graphite-700)]">{user?.email ?? "Secure workspace"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

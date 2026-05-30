import { LayoutDashboard, LogOut, Menu, Sparkles } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { requestLandingSectionScroll } from "@/lib/landing-scroll";
import { cn } from "@/lib/utils";

const links = [
  { label: "Pillars", href: "#features" },
  { label: "Workflow", href: "#how-it-works" },
  { label: "Preview", href: "#product-preview" },
  { label: "Start", href: "#pricing" }
] as const;

export function PublicNavbar() {
  const [isCompact, setIsCompact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading, signOut, user } = useAuth();
  const fullName =
    typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined;
  const email = user?.email ?? "";
  const avatarUrl =
    typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : undefined;
  const displayName = fullName || email || "Account";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    let ticking = false;

    const updateCompactState = () => {
      setIsCompact(window.scrollY > 28);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }

      window.requestAnimationFrame(updateCompactState);
      ticking = true;
    };

    updateCompactState();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLandingLinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setMobileMenuOpen(false);

    const sectionId = href.replace("#", "");
    if (!sectionId) {
      return;
    }

    if (window.location.pathname !== "/") {
      window.location.assign(`/${href}`);
      return;
    }

    requestLandingSectionScroll(sectionId);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-3 transition-all duration-300 ease-out motion-reduce:transition-none",
          isCompact
            ? "min-h-14 w-[min(calc(100%-0.25rem),64rem)] rounded-full border border-black/10 bg-white/88 px-2.5 py-2 shadow-[0_18px_60px_rgba(15,23,32,0.14)] backdrop-blur-2xl sm:px-4"
            : "min-h-16 w-[min(calc(100%-0.25rem),78rem)] rounded-[30px] border border-white/70 bg-white/54 px-3 py-3 shadow-[0_18px_70px_rgba(15,23,32,0.1)] backdrop-blur-2xl sm:px-5"
        )}
      >
        <Link to="/" className="flex items-center gap-3">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center bg-[var(--color-graphite-950)] text-white transition-all duration-300",
              isCompact ? "h-10 w-10 rounded-full" : "h-11 w-11 rounded-2xl"
            )}
          >
            <Sparkles className={cn("transition-all duration-300", isCompact ? "h-4 w-4" : "h-5 w-5")} />
          </div>
          <div className="min-w-0">
            <p className="truncate whitespace-nowrap font-[var(--font-heading)] text-xs font-semibold tracking-[0.1em] uppercase text-[var(--color-graphite-700)] sm:text-sm sm:tracking-[0.12em]">
              Smart Career Hub
            </p>
            <p
              className={cn(
                "hidden text-sm text-[var(--color-graphite-700)] transition-all duration-300 sm:block",
                isCompact && "h-0 translate-y-1 overflow-hidden opacity-0"
              )}
            >
              Career cockpit for developers
            </p>
          </div>
        </Link>

        <nav className={cn("hidden items-center lg:flex", isCompact ? "gap-5" : "gap-8")}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleLandingLinkClick(event, link.href)}
              className="whitespace-nowrap text-sm font-medium text-[var(--color-graphite-700)] motion-safe-transition hover:text-[var(--color-graphite-950)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <Button asChild variant="secondary" size={isCompact ? "sm" : "md"}>
                <NavLink to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </NavLink>
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-black/8 bg-white/72 py-1 pl-1 pr-3 shadow-[0_12px_34px_rgba(15,23,32,0.07)]">
                <Avatar className={cn(isCompact ? "h-9 w-9" : "h-10 w-10")}>
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>{initials || "CH"}</AvatarFallback>
                </Avatar>
                <div className={cn("max-w-[150px]", isCompact && "hidden xl:block")}>
                  <p className="truncate text-sm font-semibold text-[var(--color-graphite-950)]">
                    {fullName || "Signed in"}
                  </p>
                  <p className="truncate text-xs text-[var(--color-graphite-700)]">{email}</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size={isCompact ? "sm" : "md"} onClick={() => void signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size={isCompact ? "sm" : "md"} disabled={loading}>
                <NavLink to="/login">Login</NavLink>
              </Button>
              <Button asChild variant="teal" size={isCompact ? "sm" : "md"} disabled={loading}>
                <NavLink to="/signup">Start free</NavLink>
              </Button>
            </>
          )}
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button
              type="button"
              className={cn(
                "flex items-center justify-center rounded-full border border-black/8 bg-white/70 text-[var(--color-graphite-900)] transition-all duration-300",
                isCompact ? "h-10 w-10" : "h-12 w-12"
              )}
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent className="gap-8">
            <Link to="/" className="font-[var(--font-heading)] text-xl font-semibold text-[var(--color-graphite-950)]">
              Smart Career Hub
            </Link>
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleLandingLinkClick(event, link.href)}
                  className="whitespace-nowrap text-lg font-semibold text-[var(--color-graphite-900)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-auto grid gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 rounded-[24px] border border-black/8 bg-white/72 p-3">
                    <Avatar>
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback>{initials || "CH"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-graphite-950)]">
                        {fullName || "Signed in"}
                      </p>
                      <p className="truncate text-xs text-[var(--color-graphite-700)]">{email}</p>
                    </div>
                  </div>
                  <Button asChild variant="teal">
                    <NavLink to="/dashboard">Open dashboard</NavLink>
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => void signOut()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="secondary" disabled={loading}>
                    <NavLink to="/login">Login</NavLink>
                  </Button>
                  <Button asChild variant="teal" disabled={loading}>
                    <NavLink to="/signup">Start free</NavLink>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

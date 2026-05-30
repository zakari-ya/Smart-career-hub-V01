import { BarChart3, FileText, Home, MoreHorizontal, Settings2 } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  Overview: Home,
  Upload: FileText,
  Result: BarChart3,
  Settings: Settings2
} as const;

const primaryItems = navItems.filter((item) => item.label !== "Settings");
const secondaryItems = navItems.filter((item) => item.label === "Settings");

export function MobileNavigation() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-2 rounded-[26px] border border-black/6 bg-[rgba(255,255,255,0.94)] p-2 shadow-[0_20px_50px_rgba(15,23,32,0.14)] backdrop-blur-xl lg:hidden">
      {primaryItems.map((item) => {
        const Icon = iconMap[item.label];

        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex min-h-11 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-[10px] font-bold leading-none",
                isActive ? " text-white" : "text-[var(--color-graphite-700)]"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        );
      })}

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-[10px] font-bold leading-none text-[var(--color-graphite-700)]"
          >
            <MoreHorizontal className="h-4 w-4 shrink-0" />
            <span>More</span>
          </button>
        </SheetTrigger>
        <SheetContent className="gap-5">
          <div>
            <p className="font-[var(--font-heading)] text-xl font-semibold text-[var(--color-graphite-950)]">
              More
            </p>
            <p className="mt-1 text-sm text-[var(--color-graphite-700)]">Settings and workspace controls.</p>
          </div>
          <div className="grid gap-2">
            {secondaryItems.map((item) => {
              const Icon = iconMap[item.label];

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-12 items-center gap-3 rounded-[20px] px-4 text-sm font-semibold",
                      isActive
                        ? "bg-[var(--color-graphite-950)] text-white"
                        : "bg-[var(--color-surface-100)] text-[var(--color-graphite-800)]"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}

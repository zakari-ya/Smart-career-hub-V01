import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useCurrentProfile } from "@/features/auth/hooks/use-current-profile";

export function PasswordSecurityBanner() {
  const profileQuery = useCurrentProfile();
  const profile = profileQuery.data;

  if (!profile || profile.hasPassword) {
    return null;
  }

  return (
    <div className="mx-4 mt-4 rounded-[24px] border border-[rgba(18,183,166,0.22)] bg-[rgba(18,183,166,0.08)] p-4 sm:mx-5 lg:mx-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-graphite-950)] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-graphite-950)]">Secure your account</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-graphite-700)]">
              Add a password so you can sign in faster next time.
            </p>
          </div>
        </div>
        <Button asChild variant="teal" size="sm" className="shrink-0">
          <Link to="/dashboard/set-password">Set password</Link>
        </Button>
      </div>
    </div>
  );
}

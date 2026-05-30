import { CheckCircle2 } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function StrengthsCard({ strengths }: { strengths: string[] }) {
  return (
    <Card className="h-full">
      <CardDescription>Strengths</CardDescription>
      <CardTitle className="mt-2">Signals already working in your favor</CardTitle>
      <ul className="mt-5 space-y-4">
        {strengths.map((strength) => (
          <li key={strength} className="flex gap-3 text-sm leading-6 text-[var(--color-graphite-700)]">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success-500)]" />
            <span>{strength}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

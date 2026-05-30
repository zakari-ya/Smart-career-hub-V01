import { AlertTriangle } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function WeaknessesCard({ weaknesses }: { weaknesses: string[] }) {
  return (
    <Card className="h-full">
      <CardDescription>Weaknesses</CardDescription>
      <CardTitle className="mt-2">Where recruiters may hesitate</CardTitle>
      <ul className="mt-5 space-y-4">
        {weaknesses.map((weakness) => (
          <li key={weakness} className="flex gap-3 text-sm leading-6 text-[var(--color-graphite-700)]">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning-500)]" />
            <span>{weakness}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

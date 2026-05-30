import { Lightbulb } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function SuggestionsCard({ suggestions }: { suggestions: string[] }) {
  return (
    <Card className="h-full">
      <CardDescription>Suggestions</CardDescription>
      <CardTitle className="mt-2">Fastest ways to raise your score</CardTitle>
      <ul className="mt-5 space-y-4">
        {suggestions.map((suggestion) => (
          <li key={suggestion} className="flex gap-3 text-sm leading-6 text-[var(--color-graphite-700)]">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-teal-500)]" />
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

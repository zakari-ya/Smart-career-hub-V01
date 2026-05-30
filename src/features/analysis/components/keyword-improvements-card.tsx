import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { KeywordImprovements } from "@/features/analysis/types";

const sections = [
  {
    key: "missing",
    title: "Missing",
    description: "Important terms you should add only where they genuinely match your work."
  },
  {
    key: "recommended",
    title: "Recommended",
    description: "Stronger language that can improve recruiter and ATS readability."
  },
  {
    key: "found",
    title: "Already found",
    description: "Signals that already support your positioning and keyword coverage."
  }
] as const;

export function KeywordImprovementsCard({ improvements }: { improvements: KeywordImprovements }) {
  const hasItems = Object.values(improvements).some((items) => items.length > 0);

  return (
    <Card className="h-full">
      <CardDescription>Keyword improvements</CardDescription>
      <CardTitle className="mt-2">ATS-specific language to tighten</CardTitle>
      {hasItems ? (
        <div className="mt-5 space-y-4">
          {sections.map((section) => (
            <div
              key={section.key}
              className="rounded-[22px] border border-black/6 bg-[var(--color-surface-100)] p-4"
            >
              <p className="font-semibold text-[var(--color-graphite-950)]">{section.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-graphite-700)]">{section.description}</p>
              {improvements[section.key].length ? (
                <ul className="mt-4 space-y-2">
                  {improvements[section.key].map((item) => (
                    <li key={`${section.key}-${item}`} className="text-sm leading-6 text-[var(--color-graphite-700)]">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--color-graphite-700)]">
                  No items in this section yet.
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-black/8 bg-[var(--color-surface-100)] p-4 text-sm leading-6 text-[var(--color-graphite-700)]">
          Keyword guidance will appear here after a completed analysis.
        </div>
      )}
    </Card>
  );
}

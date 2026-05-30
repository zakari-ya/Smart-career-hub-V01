import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardTitle>Loading workspace</CardTitle>
        <CardDescription className="mt-2">
          Preparing the next Smart Career Hub surface.
        </CardDescription>
      </Card>
    </div>
  );
}

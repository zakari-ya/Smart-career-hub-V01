import { z } from "zod";

export const resumeActionSchema = z.object({
  resumeId: z.string().uuid()
});

export async function parseRequestBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}

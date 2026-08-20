import { z } from "zod";

export const apiErrorSchema = z.object({
  error: z.string(),
});

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function readApiError(response: Response, fallback: string) {
  const parsed = apiErrorSchema.safeParse(
    await response.json().catch(() => null),
  );

  return parsed.success ? parsed.data.error : fallback;
}

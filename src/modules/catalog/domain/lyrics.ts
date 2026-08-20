import { z } from "zod";

const lyricLineSchema = z.object({
  time: z.number(),
  text: z.string(),
});

export const lyricsSchema = z.array(lyricLineSchema);

export type LyricLine = z.infer<typeof lyricLineSchema>;

export function parseLyrics(value: unknown): LyricLine[] {
  const parsed = lyricsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

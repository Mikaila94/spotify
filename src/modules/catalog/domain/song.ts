import { z } from "zod";
import { lyricsSchema } from "./lyrics";

export const songIdSchema = z.coerce.number().int().positive();

export const songDTOSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  durationMs: z.number().int().nullable(),
  url: z.string(),
  album: z
    .object({
      id: z.number().int(),
      title: z.string(),
    })
    .nullable(),
  artists: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
    }),
  ),
});

export const songListSchema = z.array(songDTOSchema);

export const songLyricsDTOSchema = z.object({
  lyrics: lyricsSchema,
});

export type SongDTO = z.infer<typeof songDTOSchema>;
export type SongLyricsDTO = z.infer<typeof songLyricsDTOSchema>;

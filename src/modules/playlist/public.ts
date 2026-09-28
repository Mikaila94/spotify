import { z } from "zod";

export const playlistIdSchema = z.coerce.number().int().positive();

export interface PlaylistSummary {
  id: number;
  name: string;
}

export interface PlaylistTrack {
  id: number;
  name: string;
  durationMs: number | null;
  url: string;
  artists: Array<{ name: string }>;
}

export interface PlaylistDetail {
  id: number;
  name: string;
  description: string | null;
  tracks: PlaylistTrack[];
}

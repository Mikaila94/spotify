"use client";

import useSWR from "swr";
import { fetchSongLyrics } from "./api";
import {
  isUnauthorized,
  useCatalogUnauthorized,
  withoutUnauthorized,
} from "./useCatalogUnauthorized";

export function useSongLyrics(
  songId: number | null,
  onUnauthorized: () => void,
) {
  const { data, error, isLoading, mutate } = useSWR(
    songId === null ? null : `/api/songs/${songId}/lyrics`,
    fetchSongLyrics,
  );

  useCatalogUnauthorized(error, onUnauthorized);

  return {
    data,
    error: withoutUnauthorized(error),
    isLoading: isLoading || isUnauthorized(error),
    mutate,
  };
}

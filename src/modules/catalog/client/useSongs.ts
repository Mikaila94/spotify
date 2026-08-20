"use client";

import useSWR from "swr";
import { fetchSongs } from "./api";
import {
  isUnauthorized,
  useCatalogUnauthorized,
  withoutUnauthorized,
} from "./useCatalogUnauthorized";

export function useSongs(onUnauthorized: () => void) {
  const { data, error, isLoading, mutate } = useSWR("/api/songs", fetchSongs);

  useCatalogUnauthorized(error, onUnauthorized);

  return {
    data,
    error: withoutUnauthorized(error),
    isLoading: isLoading || isUnauthorized(error),
    mutate,
  };
}

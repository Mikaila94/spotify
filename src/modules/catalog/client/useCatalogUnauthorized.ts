"use client";

import { useEffect } from "react";
import { UnauthorizedError } from "./api";

export function useCatalogUnauthorized(
  error: unknown,
  onUnauthorized: () => void,
) {
  useEffect(() => {
    if (error instanceof UnauthorizedError) {
      onUnauthorized();
    }
  }, [error, onUnauthorized]);
}

export function withoutUnauthorized(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return undefined;
  }

  return error;
}

export function isUnauthorized(error: unknown) {
  return error instanceof UnauthorizedError;
}

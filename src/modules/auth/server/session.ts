import "server-only";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { z } from "zod";

const SESSION_COOKIE_NAME = "ACCESS_TOKEN";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

const sessionPayloadSchema = z.object({
  id: z.number().int().positive(),
  email: z.email(),
});

export type SessionUser = z.infer<typeof sessionPayloadSchema>;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export async function createSession(user: SessionUser) {
  const token = jwt.sign(user, getJwtSecret(), {
    expiresIn: SESSION_DURATION_SECONDS,
  });

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const result = sessionPayloadSchema.safeParse(payload);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

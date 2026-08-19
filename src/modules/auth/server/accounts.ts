import "server-only";

import { Prisma } from "@/generated/prisma/client";
import bcrypt from "bcrypt";
import prisma from "@/shared/db/prisma";
import type { AuthUser, SignInInput, SignUpInput } from "../public";

const authUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
} as const;

export async function authenticateUser(
  input: SignInInput,
): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export type RegisterUserResult =
  | { status: "created"; user: AuthUser }
  | { status: "email_taken" };

export async function registerUser(
  input: SignUpInput,
): Promise<RegisterUserResult> {
  const passwordHash = await bcrypt.hash(input.password, await bcrypt.genSalt());

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      },
      select: authUserSelect,
    });

    return { status: "created", user };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { status: "email_taken" };
    }

    throw error;
  }
}

// app/api/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { signUpSchema } from "@/features/auth/schemas";
import { createSession } from "@/features/auth/session";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const result = signUpSchema.safeParse(
    await req.json().catch(() => null)
  );

  if (!result.success) {
    return NextResponse.json(
      {
        error:
          result.error.issues[0]?.message ?? "Enter valid account details",
      },
      { status: 400 }
    );
  }

  const { email, password, firstName, lastName } = result.data;

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
  } catch (err) {
    console.error("Error creating user:", err);

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 }
    );
  }

  try {
    await createSession({ id: user.id, email: user.email });
  } catch (error) {
    console.error("Unable to create session:", error);
    return NextResponse.json(
      { error: "User created, but sign-in session failed" },
      { status: 500 }
    );
  }

  return NextResponse.json(user, { status: 201 });
}

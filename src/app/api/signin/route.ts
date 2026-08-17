import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signInSchema } from "@/features/auth/schemas";
import { createSession } from "@/features/auth/session";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const result = signInSchema.safeParse(
    await req.json().catch(() => null)
  );

  if (!result.success) {
    return NextResponse.json(
      {
        error:
          result.error.issues[0]?.message ?? "Enter valid sign-in details",
      },
      { status: 400 }
    );
  }

  const { email, password } = result.data;

  // 1) Look up the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // 2) Compare passwords
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  try {
    await createSession({ id: user.id, email: user.email });
  } catch (error) {
    console.error("Unable to create session:", error);
    return NextResponse.json(
      { error: "Unable to create session" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    { status: 200 }
  );
}

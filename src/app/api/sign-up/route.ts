import { NextResponse } from "next/server";
import { signUpSchema } from "@/modules/auth/public";
import { createSession, registerUser } from "@/modules/auth/server";

export async function POST(req: Request) {
  const result = signUpSchema.safeParse(
    await req.json().catch(() => null),
  );

  if (!result.success) {
    return NextResponse.json(
      {
        error:
          result.error.issues[0]?.message ?? "Enter valid account details",
      },
      { status: 400 },
    );
  }

  let registration: Awaited<ReturnType<typeof registerUser>>;

  try {
    registration = await registerUser(result.data);
  } catch (error) {
    console.error("Unable to create account:", error);
    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 },
    );
  }

  if (registration.status === "email_taken") {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const { user } = registration;

  try {
    await createSession({ id: user.id, email: user.email });
  } catch (error) {
    console.error("Unable to create session:", error);
    return NextResponse.json(
      { error: "User created, but sign-in session failed" },
      { status: 500 },
    );
  }

  return NextResponse.json(user, { status: 201 });
}

import { NextResponse } from "next/server";
import { signInSchema } from "@/modules/auth/public";
import { authenticateUser, createSession } from "@/modules/auth/server";

export async function POST(req: Request) {
  const result = signInSchema.safeParse(
    await req.json().catch(() => null),
  );

  if (!result.success) {
    return NextResponse.json(
      {
        error:
          result.error.issues[0]?.message ?? "Enter valid sign-in details",
      },
      { status: 400 },
    );
  }

  try {
    const user = await authenticateUser(result.data);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    await createSession({ id: user.id, email: user.email });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Unable to sign in:", error);
    return NextResponse.json(
      { error: "Unable to sign in" },
      { status: 500 },
    );
  }
}

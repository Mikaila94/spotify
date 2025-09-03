import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  // 1) Look up the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "The user doesn't exist" },
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

  // 3) Generate token
  const token = jwt.sign(
    { email: user.email, id: user.id, time: Date.now() },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  );

  // 4) Set cookie
  (await cookies()).set("ACCESS_TOKEN", token, {
    httpOnly: true,
    maxAge: 8 * 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // 5) Return safe user object
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

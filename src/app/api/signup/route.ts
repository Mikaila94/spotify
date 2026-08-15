// app/api/signup/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password, firstName, lastName } = await req.json();

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  let user;
  try {
    user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      { error: "Failed to create user, user might already exist" },
      { status: 409 }
    );
  }

  try {
    const token = jwt.sign(
      { email: user.email, id: user.id, time: Date.now() },
      process.env.JWT_SECRET!, // don’t hardcode
      { expiresIn: "8h" }
    );

    (await cookies()).set("ACCESS_TOKEN", token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    return NextResponse.json(
      { error: "User created, but sign-in session failed" },
      { status: 500 }
    );
  }

  return NextResponse.json(user, { status: 201 });
}

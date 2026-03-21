import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;
  const secret = process.env.ADMIN_JWT_SECRET || "fallback-secret";

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ error: "帳號或密碼錯誤" }, { status: 401 });
  }

  const token = await new SignJWT({ user: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(new TextEncoder().encode(secret));

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

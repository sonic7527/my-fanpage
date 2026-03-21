import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function verifyAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const secret = process.env.ADMIN_JWT_SECRET || "fallback-secret";

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return null; // authorized
  } catch {
    return NextResponse.json({ error: "登入已過期，請重新登入" }, { status: 401 });
  }
}

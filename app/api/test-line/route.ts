import { NextRequest, NextResponse } from "next/server";
import { pushMessage } from "@/lib/line";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("key");
  // 簡單保護，避免被隨意呼叫
  if (secret !== "bei-da-test-2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const adminId = process.env.LINE_ADMIN_USER_ID;
  if (!adminId) {
    return NextResponse.json({ error: "LINE_ADMIN_USER_ID not set" }, { status: 500 });
  }

  try {
    await pushMessage(adminId, "✅ LINE 測試成功！北大液晶儀表維修網站的 LINE 通知功能正常運作。");
    return NextResponse.json({ ok: true, message: "Test message sent to admin" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
